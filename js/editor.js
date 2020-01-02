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
        this._updateModal();
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

    _updateModal() {

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

    _getSqlPreparedData(layer) {
        const lat = layer._latlng.lat;
        const lng = layer._latlng.lng;
        let data = {
            lat: lat,
            lng: lng,
            geometryGeneratorFn: `ST_GeomFromText('POINT(${lng} ${lat})', 4326)`,
            id: layer.feature.properties.cartodb_id,
            name: layer.feature.properties.name,
            description: layer.feature.properties.description,
            category: layer.feature.properties.category,
            contributor: layer.feature.properties.contributor
        };
        // escape single quotes
        data.name = data.name.replace('\'', '\'\'');
        data.description = data.description.replace('\'', '\'\'');
        data.contributor = data.contributor.replace('\'', '\'\'');
        return data;
    }

    save() {

        this.updateLayer(this.selectedLayer);

        $(`#${this.modalId}`).modal('hide');

        const d = this._getSqlPreparedData(this.selectedLayer);

        this.selectedLayer.setIcon(markerIcons[d.category]);

        if (this.mode == this.CREATE_MODE) {

            this.drawingLayer.addLayer(this.selectedLayer);
            this.selectedLayer.on('click', e => this.startUpdateFeature(e.target));

            let sql = `INSERT INTO markers (the_geom, name, description, category, contributor) ` +
                `VALUES (${d.geometryGeneratorFn}, '${d.name}', '${d.description}', '${d.category}', '${d.contributor}')`;

            $.ajax({
                method: 'GET',
                url: `https://geomo.carto.com/api/v2/sql?api_key=${apiKey}&q=${sql}`
            }).done((response) => {
                
                toastr.success(`Marker ${d.name} successfully created.`, `Marker ${d.name}`);

                // get cartodb_id from latest created marker at given position
                sql = `SELECT * FROM markers WHERE the_geom = ${d.geometryGeneratorFn} ORDER BY cartodb_id DESC`;
                $.ajax({
                    method: 'GET',
                    url: `https://geomo.carto.com/api/v2/sql?format=geojson&q=${sql}`
                }).done((response) => {
                    const id = response.features[0].properties.cartodb_id;
                    this.selectedLayer.feature.properties.cartodb_id = id;
                });

            });

        }
        else {

            const sql = `UPDATE markers SET the_geom = ${d.geometryGeneratorFn}, name = '${d.name}', description = '${d.description}', ` +
                `category = '${d.category}', contributor = '${d.contributor}' WHERE cartodb_id = ${d.id}`;

            $.ajax({
                method: 'GET',
                url: `https://geomo.carto.com/api/v2/sql?api_key=${apiKey}&q=${sql}`
            }).done((response) => {
                toastr.success(`Marker ${d.name} successfully updated.`, `Marker ${d.name}`);
            });

        }

        this.selectedLayer.bindTooltip(this.selectedLayer.feature.properties.name);

    }

    delete() {

        this.drawingLayer.removeLayer(this.selectedLayer);
        this.alternativeDrawingLayer.removeLayer(this.selectedLayer);

        const d = this._getSqlPreparedData(this.selectedLayer);
        const sql = `DELETE FROM markers WHERE cartodb_id = ${d.id}`;
        const url = `https://geomo.carto.com/api/v2/sql?api_key=${apiKey}&q=${sql}`;
        $.ajax({
            method: 'GET',
            url: url
        }).done((response) => {
            toastr.success(`Marker ${d.name} successfully deleted.`, `Marker ${d.name}`);
        });

        $(`#${this.modalId}`).modal('hide');

    }

}

