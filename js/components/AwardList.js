class AwardList extends HTMLElement {
    constructor() {
        super();
        this.awards = [];
    }

    async connectedCallback() {
        try {
            const response = await fetch('/data/awards.json');
            const data = await response.json();
            this.awards = data.awards;
            this.render();
        } catch (error) {
            console.error('Error loading awards:', error);
        }
    }

    render() {
        const awardsList = document.createElement('div');
        awardsList.className = 'awards-list';

        this.awards.forEach(yearGroup => {
            const yearGroupDiv = document.createElement('div');
            yearGroupDiv.className = 'award-year-group';

            const yearLabel = document.createElement('div');
            yearLabel.className = 'year-label';
            yearLabel.textContent = yearGroup.year;

            const yearAwards = document.createElement('div');
            yearAwards.className = 'year-awards';

            const awardItem = document.createElement('div');
            awardItem.className = 'award-item';

            yearGroup.items.forEach(award => {
                const awardInfo = document.createElement('div');
                awardInfo.className = 'award-info';

                const awardHeader = document.createElement('div');
                awardHeader.className = 'award-header';

                const awardName = document.createElement('h4');
                awardName.className = 'award-name';
                awardName.textContent = award.name;

                const awardTag = document.createElement('span');
                awardTag.className = `award-tag ${award.type}`;
                awardTag.textContent = award.type.charAt(0).toUpperCase() + award.type.slice(1);

                const awardOrg = document.createElement('p');
                awardOrg.className = 'award-org';
                awardOrg.textContent = award.organization;

                awardHeader.appendChild(awardName);
                awardHeader.appendChild(awardTag);
                awardInfo.appendChild(awardHeader);
                awardInfo.appendChild(awardOrg);
                awardItem.appendChild(awardInfo);
            });

            yearAwards.appendChild(awardItem);
            yearGroupDiv.appendChild(yearLabel);
            yearGroupDiv.appendChild(yearAwards);
            awardsList.appendChild(yearGroupDiv);
        });

        this.innerHTML = '';
        this.appendChild(awardsList);
    }
}

customElements.define('award-list', AwardList);