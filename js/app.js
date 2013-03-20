window.App = {
    // Keep track of which screens we came from
    screens: {
        settings: 'settings',
        prev: '',
        cur: ''
    },
    dom: {},
    data: {
        timer: undefined,
    },


    init: function() {  
        var that = this;

        this.sensor_log = SensorLog.init();  

        this.dom.$output = jQuery('#output');
        this.dom.$titlebar = jQuery('#titlebar');
        this.dom.$data_table = jQuery('#data_table>tbody');
        this.dom.$comment = jQuery('#data_comment');

        this.generate_data_table(this.sensor_log.all_data());
        
        document.addEventListener('SensorLog:new_data', function(e) {
            that.append_table_data(e.data);
        });

        this.dom.$comment.on('blur', function(){
            that.sensor_log.set_comment(this.value);
        });
    },

    toggle_logging: function() {
        SensorLog.toggle();
        if (SensorLog.data.timer === undefined) {
            this.dom.$titlebar[0].setActionCaption("Start");

        } else {
            this.dom.$titlebar[0].setActionCaption("Stop");
        }
    },

    append_table_data: function(data) {
        this.dom.$output.html(data);
        this.dom.$data_table[0].insertBefore(
            this.generate_table_row(data),
            this.dom.$data_table[0].rows[0]);
    },

    generate_data_table: function(data) {
        var row, cell;

        for(var i=0; i<data.length; i++) {
            if(data[i].coords === undefined) continue;

            row = this.generate_table_row(data[i]);
            this.dom.$data_table[0].appendChild(row);
        }
    },

    generate_table_row: function(data) {
        var row, cell;
        row = document.createElement('tr');
            
        cell = document.createElement('td');
        cell.innerHTML = data.coords.latitude;
        row.appendChild(cell);

        cell = document.createElement('td');
        cell.innerHTML = data.coords.longitude;
        row.appendChild(cell);

        cell = document.createElement('td');
        cell.innerHTML = data.comment || "&nbsp;";
        row.appendChild(cell);

        return row;
    },

    ////////// Helper methods
    show_settings: function(){
        bb.pushScreen('screen_settings.htm', this.screens.settings);
    },

    load_settings: function(screen) {
        $(screen).find('#settings_delay').val(SensorLog.data.delay);

        SettingsController.init(screen);
    },

    save_settings: function(){
        SensorLog.data.delay = Number($('#settings_delay').val());

        delete this.settings;
    }

}

window.SettingsController = {
    dom: {
        data_table: undefined
    },

    init: function(screen){
        this.context = screen;
        this.dom_init();
        return this;
    },

    dom_init: function() {},

    clear_data: function() {
        SensorLog.clear_data();
    },

    dump_data: function() {
        alert(SensorLog.data_as_string());
    },
}