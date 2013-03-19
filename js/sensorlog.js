window.SensorLog = {
    ///// GLOBAL DATA
    data: {
        // Last compass reading
        azimuth: undefined,
        storage: window.localStorage,
        timer: undefined,
        delay: 5000,

        callbacks: {
            compass_callback: undefined,
            log_data: undefined
        }
    },

    ///// METHODS
    init: function() {
        // set up callbacks with the right context
        this.data.callbacks.compass_callback = $.proxy(this.compass_callback, this);
        this.data.callbacks.log_data = $.proxy(this.log_data, this);

        // Ripple doesn't support sensor data, boo.
        if(blackberry.sensors !== undefined) {
            blackberry.sensors.setOptions("devicecompass", { 
                delay: this.data.delay,
                background: true
            });

        }
    },

    start: function() {
        blackberry.event.addEventListener("devicecompass", 
            this.data.callbacks.compass_callback);

        this.data.timer = setInterval(
            this.data.callbacks.log_data, this.data.delay)

    },

    stop: function() {
        blackberry.event.removeEventListener("devicecompass", 
            this.data.callbacks.compass_callback);

        clearInterval(this.data.timer);
        this.data.timer = undefined;
    },

    toggle: function() {
        if(this.data.timer === undefined)
            this.start();
        else
            this.stop();
    },


    log_data: function() {
        navigator.geolocation.getCurrentPosition(
            $.proxy(this.geolocation_callback, this));
    },

    // Called when there's new GPS data
    geolocation_callback: function(data) {
        var store_data = {
                coords: data.coords,
                azimuth: this.data.azimuth
            },
            data_string = JSON.stringify(store_data),
            data_event;

        this.data.storage.setItem(data.timestamp, data_string);

        data_event = new CustomEvent('SensorLog:new_data');
        data_event.data = data_string;

        document.dispatchEvent(data_event);
    },

    compass_callback: function(data) {
        this.data.azimuth = data.value;
    },

    /// DATA
    clear_data: function() {        
        this.data.storage.clear();
    },

    // Return array of all data as a JSON string
    data_as_string: function(){
        var data_string = "[";

        for(var i=0; i < this.data.storage.length; i++) {
            data_string += this.data.storage.getItem(
                this.data.storage.key(i));

            if(i !== this.data.storage.length-1)
                data_string += ",";
        }

        return data_string+']';
    },

    latest_data: function() {
        var storage = this.data.storage;

        return storage.getItem(storage.key(storage.length-1));
    }
};