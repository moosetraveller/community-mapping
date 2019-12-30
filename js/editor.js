// don't do this, only for test purpose -> find another solution (hide api key in production)
const apiKey = 'HvMRWvk-WCVhCmyDpNzEiw';

class Editor {

    constructor(modalId, drawingLayer) {
        this.modalId = modalId;
        this.drawingLayer = drawingLayer;
        this.mode = 'create';
        this.selectedLayer = null;
    }

    UPDATE_MODE = 'update';
    CREATE_MODE = 'create';

    setAlternativeDrawingLayer(alternativeDrawingLayer) {
        this.alternativeDrawingLayer = alternativeDrawingLayer;
    }

    openEditModal() {
        $(`#${this.modalId} .btn-danger`).css('display', this.mode == this.UPDATE_MODE ? 'block' : 'none')
        this.updateModal();
        $(`#${this.modalId}`).modal('show');
    }

    startCreateFeature(layer) {

        let feature = layer.feature = layer.feature || {};
        feature.type = feature.type || 'Feature';
        feature.properties = feature.properties || {
            name: null,
            description: null,
            category: null,
            contributor: null
        };

        this.mode = this.CREATE_MODE;
        this.selectedLayer = layer;

        this.openEditModal();

    }

    startUpdateFeature(layer) {

        this.mode = this.UPDATE_MODE;
        this.selectedLayer = layer;

        this.openEditModal();

    }

    updateModal() {

        // reset input fields
        $(`#${this.modalId} #editFields .form-control`).each((_, input) => {
            input.value = '';
        });

        // fill/update input fields
        for (const key of Object.keys(this.selectedLayer.feature.properties)) {
            const input = $(`#${this.modalId} #editFields #${key}`);
            if (input.length > 0) {
                input.val(this.selectedLayer.feature.properties[key]);
            }
        }

    }

    updateLayer(layer) {

        $(`#${this.modalId} #editFields .form-control`).each((_, input) => {
            layer.feature.properties[input.id] = input.value;
        });

    }

    getSelectedLayerData() {
        const lat = this.selectedLayer._latlng.lat;
        const lng = this.selectedLayer._latlng.lng;
        return {
            lat: lat,
            lng: lng,
            geometryGeneratorFn: `ST_GeomFromText('POINT(${lng} ${lat})', 4326)`,
            id: this.selectedLayer.feature.properties.cartodb_id,
            name: this.selectedLayer.feature.properties.name,
            description: this.selectedLayer.feature.properties.description,
            category: this.selectedLayer.feature.properties.category,
            contributor: this.selectedLayer.feature.properties.contributor
        }
    }

    save() {

        this.updateLayer(this.selectedLayer);

        $(`#${this.modalId}`).modal('hide');

        const d = this.getSelectedLayerData();
        let url = ""

        if (this.mode == this.CREATE_MODE) {

            this.drawingLayer.addLayer(this.selectedLayer);
            this.selectedLayer.on('click', e => this.startUpdateFeature(e.target));

            const sql = `INSERT INTO markers (the_geom, name, description, category, contributor) ` +
                `VALUES (${d.geometryGeneratorFn}, '${d.name}', '${d.description}', '${d.category}', '${d.contributor}')`;

            url = `https://geomo.carto.com/api/v2/sql?api_key=${apiKey}&q=${sql}`;

        }
        else {

            const sql = `UPDATE markers SET the_geom = ${d.geometryGeneratorFn}, name = '${d.name}', description = '${d.description}', ` +
                `category = '${d.category}', contributor = '${d.contributor}' WHERE cartodb_id = ${d.id}`;

            url = `https://geomo.carto.com/api/v2/sql?api_key=${apiKey}&q=${sql}`;

        }

        $.ajax({
            method: 'GET',
            url: url
        }).done(function (msg) {
            console.log('Created/Modified');
            console.log(msg);
        });

        this.selectedLayer.bindTooltip(this.selectedLayer.feature.properties.name);

    }

    delete() {

        this.drawingLayer.removeLayer(this.selectedLayer);
        this.alternativeDrawingLayer.removeLayer(this.selectedLayer);

        const d = this.getSelectedLayerData();
        const sql = `DELETE FROM markers WHERE cartodb_id = ${d.id}`;
        const url = `https://geomo.carto.com/api/v2/sql?api_key=${apiKey}&q=${sql}`;
        $.ajax({
            method: 'GET',
            url: url
        }).done(function (msg) {
            console.log('Deleted');
            console.log(msg);
        });

        $(`#${this.modalId}`).modal('hide');

    }

}

