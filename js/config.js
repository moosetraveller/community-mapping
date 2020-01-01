// class FontAwesomeIconDiv {
//     constructor(iconName) {
//         this.html = `<i class="fa fa-2x fa-${iconName}"></i>`;
//         this.iconSize = [20, 20];
//         this.className = 'dummy';
//     }
// }

// const markerIcons = {
//     solution: L.divIcon(new FontAwesomeIconDiv('lightbulb')),
//     problem: L.divIcon(new FontAwesomeIconDiv('exclamation-triangle')),
//     currentEvent: L.divIcon(new FontAwesomeIconDiv('calendar-alt')),
//     pastEvent: L.divIcon(new FontAwesomeIconDiv('calendar-alt')),
//     organizationOrAssociation: L.divIcon(new FontAwesomeIconDiv('sitemap')),
//     news: L.divIcon(new FontAwesomeIconDiv('newspaper'))
// };

let AssetIcon = L.Icon.extend({
    options: {
        iconSize: [32, 32],
        iconAnchor: [18, 18],
        popupAnchor: [0, 0]
    }
});

const markerIcons = {
    solution: new AssetIcon({ iconUrl: './img/lightbulb.svg' }),
    problem: new AssetIcon({ iconUrl: './img/warning.svg' }),
    currentEvent: new AssetIcon({ iconUrl: './img/calendar.svg' }),
    pastEvent: new AssetIcon({ iconUrl: './img/checklist.svg' }),
    organizationOrAssociation: new AssetIcon({ iconUrl: './img/diagram.svg' }),
    news: new AssetIcon({ iconUrl: './img/chat.svg' })
};