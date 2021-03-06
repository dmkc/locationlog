window.SensorLog = {
    ///// GLOBAL DATA
    data: {
        // Last compass reading
        azimuth: undefined,
        storage: window.localStorage,
        timer: undefined,
        delay: 5000,
        comment: 'N/A',

        callbacks: {
            compass_callback: undefined,
            get_gps_data: undefined
        }
    },

    ///// METHODS
    init: function() {
        // set up callbacks with the right context
        this.data.callbacks.compass_callback = $.proxy(this.compass_callback, this);
        this.data.callbacks.get_gps_data = $.proxy(this.get_gps_data, this);

        // Ripple doesn't support sensor data, boo.
        if(blackberry.sensors !== undefined) {
            blackberry.sensors.setOptions("devicecompass", { 
                delay: this.data.delay,
                background: true
            });

        }

        return this;
    },

    start: function() {
        blackberry.event.addEventListener("devicecompass", 
            this.data.callbacks.compass_callback);

        this.data.timer = setInterval(
            this.data.callbacks.get_gps_data, this.data.delay)

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


    get_gps_data: function() {
        navigator.geolocation.getCurrentPosition(
            $.proxy(this.geolocation_callback, this),
            function(err){
                console.log("Problems with GPS:", err);
            }, 
            {
                 maximumAge: this.data.delay,
                 enableHighAccuracy: true
            });
    },

    set_comment: function(comment) {
        this.data.comment = comment;
    },

    // Called when there's new GPS data
    geolocation_callback: function(data) {
        var store_data = {
                timestamp: data.timestamp,
                coords: data.coords,
                azimuth: this.data.azimuth,
                comment: this.data.comment
            },
            data_string = JSON.stringify(store_data),
            data_event;

        this.data.storage.setItem(store_data.timestamp, data_string);

        data_event = new CustomEvent('SensorLog:new_data');
        data_event.data = store_data;

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
    },

    all_data: function() {
        var result = [], obj;
        
        for(var i=0; i < this.data.storage.length; i++) {
            obj = JSON.parse(this.data.storage.getItem(this.data.storage.key(i)));
            result.push(obj);
        }

        return result;
    }
};