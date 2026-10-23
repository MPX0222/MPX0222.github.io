#!/usr/bin/env python3
"""Unit tests for Hugging Face download aggregation. No network."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from update_hf_downloads import (  # noqa: E402
    HuggingFaceError,
    apply_huggingface_stats,
    arxiv_id_from_publication,
    huggingface_stats,
    next_link,
    parse_huggingface_url,
)


def check(name, cond):
    print(f"{'PASS' if cond else 'FAIL'}: {name}")
    if not cond:
        raise AssertionError(name)


SQL = {
    "title": "SQL-R1",
    "doi": "https://doi.org/10.52202/085713-5805",
    "links": {
        "pdf": "https://arXiv.org/pdf/2504.08600",
        "huggingface": "https://huggingface.co/MPX0222forHF/SQL-R1-7B",
    },
    "stats": {"citations": 114},
}

DATA = {
    "title": "DecisionPivot",
    "doi": "10.48550/arXiv.2610.28522",
    "links": {
        "pdf": "https://arxiv.org/abs/2610.28522",
        "huggingface": "https://huggingface.co/datasets/startlux-models/DecisionPivot",
    },
    "stats": {"citations": 0},
}


def fake_fetch(routes):
    def fetch(url):
        if url not in routes:
            raise AssertionError(f"unexpected url {url}")
        payload, link = routes[url]
        return payload, link
    return fetch


def sql_routes(include_linked=True, extra_owner=False):
    models = [
        {"id": "MPX0222forHF/SQL-R1-14B", "downloadsAllTime": 881},
        {"id": "MPX0222forHF/SQL-R1-3B", "downloadsAllTime": 2772},
        {"id": "other/SQL-R1-fork", "downloadsAllTime": 99999},
    ]
    if include_linked:
        models.append({"id": "MPX0222forHF/SQL-R1-7B", "downloadsAllTime": 2490})
    if extra_owner:
        models.append({"id": "MPX0222forHF/not-this", "downloadsAllTime": 1})
    datasets = [
        {"id": "MPX0222forHF/SynSQL-Complex-5K", "downloadsAllTime": 2793},
        {"id": "someone/other-data", "downloadsAllTime": 50},
    ]
    routes = {
        "https://huggingface.co/api/models?filter=arxiv%3A2504.08600&expand%5B%5D=downloadsAllTime&limit=100": (models, None),
        "https://huggingface.co/api/datasets?filter=arxiv%3A2504.08600&expand%5B%5D=downloadsAllTime&limit=100": (datasets, None),
    }
    return routes


def test_parsing():
    check("arxiv id comes from a pdf url", arxiv_id_from_publication(SQL) == "2504.08600")
    check("arxiv id comes from a doi", arxiv_id_from_publication(DATA) == "2610.28522")
    check(
        "model url keeps the account",
        parse_huggingface_url(SQL["links"]["huggingface"]) == ("model", "MPX0222forHF", "MPX0222forHF/SQL-R1-7B"),
    )
    check(
        "dataset url skips the datasets prefix",
        parse_huggingface_url(DATA["links"]["huggingface"]) == ("dataset", "startlux-models", "startlux-models/DecisionPivot"),
    )
    check("next link is read from the header", next_link('<https://example.test/next>; rel="next"') == "https://example.test/next")


def test_series_sum_excludes_other_accounts():
    stats = huggingface_stats(SQL, fake_fetch(sql_routes(extra_owner=True)))
    ids = [repo["id"] for repo in stats["repos"]]
    check("series keeps same-account models and the dataset", ids == [
        "MPX0222forHF/SQL-R1-14B",
        "MPX0222forHF/SQL-R1-3B",
        "MPX0222forHF/SQL-R1-7B",
        "MPX0222forHF/not-this",
        "MPX0222forHF/SynSQL-Complex-5K",
    ])
    check("cumulative total adds models and datasets", stats["downloads"] == 881 + 2772 + 2490 + 2793 + 1)
    check("third-party fork is excluded", "other/SQL-R1-fork" not in ids)


def test_linked_repo_is_added_when_the_card_has_no_arxiv_tag():
    routes = sql_routes(include_linked=False)
    routes["https://huggingface.co/api/models/MPX0222forHF/SQL-R1-7B?expand%5B%5D=downloadsAllTime"] = (
        {"id": "MPX0222forHF/SQL-R1-7B", "downloadsAllTime": 2490},
        None,
    )
    stats = huggingface_stats(SQL, fake_fetch(routes))
    check(
        "linked model is merged into the series",
        any(repo["id"] == "MPX0222forHF/SQL-R1-7B" for repo in stats["repos"]),
    )
    check("merged total still includes the linked model", stats["downloads"] == 881 + 2772 + 2490 + 2793)


def test_blank_link_clears_a_stale_total_without_fetching():
    data = {
        "publications": [
            {"links": {"huggingface": ""}, "stats": {"citations": 3, "huggingface": {"downloads": 10, "repos": []}}},
            json.loads(json.dumps(SQL)),
        ]
    }
    calls = []

    def fetch(url):
        calls.append(url)
        return sql_routes()[url]

    changed = apply_huggingface_stats(data, fetch)
    check("stale total is removed", "huggingface" not in data["publications"][0]["stats"])
    check("citation count stays", data["publications"][0]["stats"]["citations"] == 3)
    check("series publication is filled", data["publications"][1]["stats"]["huggingface"]["downloads"] == 881 + 2772 + 2490 + 2793)
    check("an update is reported", changed)
    check("blank link made no request", all("2610" not in url and "DecisionPivot" not in url for url in calls))
    unchanged = apply_huggingface_stats(data, fetch)
    check("a second pass with the same numbers does not count as a change", unchanged is False)


def test_missing_all_time_field_fails_before_writing():
    routes = sql_routes()
    models_url = next(url for url in routes if "/api/models?" in url)
    payload, link = routes[models_url]
    routes[models_url] = ([{**payload[0], "downloadsAllTime": None}, *payload[1:]], link)
    data = {"publications": [json.loads(json.dumps(SQL))]}
    try:
        apply_huggingface_stats(data, fake_fetch(routes))
    except HuggingFaceError as error:
        check("missing cumulative field is an error", "downloadsAllTime" in str(error))
    else:
        check("missing cumulative field is an error", False)
    check("failed refresh leaves the publication untouched", "huggingface" not in data["publications"][0]["stats"])


def main():
    test_parsing()
    test_series_sum_excludes_other_accounts()
    test_linked_repo_is_added_when_the_card_has_no_arxiv_tag()
    test_blank_link_clears_a_stale_total_without_fetching()
    test_missing_all_time_field_fails_before_writing()
    print("ALL PASSED")


if __name__ == "__main__":
    main()
