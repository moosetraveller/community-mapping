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

    save() {

        this.updateLayer(this.selectedLayer);

        $(`#${this.modalId}`).modal('hide');

        if (this.mode == this.CREATE_MODE) {
            this.drawingLayer.addLayer(this.selectedLayer);
            this.selectedLayer.on('click', e => this.startUpdateFeature(e.target));
            // TODO create layer on server
        }
        else {
            // TODO update layer on server
        }
        this.selectedLayer.bindTooltip(this.selectedLayer.feature.properties.name);

    }

    delete() {
        
        this.drawingLayer.removeLayer(this.selectedLayer);
        this.alternativeDrawingLayer.removeLayer(this.selectedLayer); 
        
        // TODO delete layer on server

        $(`#${this.modalId}`).modal('hide');

    }

}

