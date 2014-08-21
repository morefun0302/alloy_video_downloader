exports.definition = {

    config : {
        "columns" : {
            "video_id": "TEXT",
            "video_title" : "TEXT",
            "video_excerpt" : "TEXT",
            "video_provider" : "TEXT",
            "video_url" : "TEXT",
            "video_image_path" : "TEXT"
        },
        "defaults" : {
            "video_id": "",
            "video_title" : "",
            "video_excerpt" : "",
            "video_provider" : "",
            "video_url" : "",
            "video_image_path" : ""
        },
        "adapter" : {
            "type" : "sql",
            "collection_name" : "downloads"
        }
    },

    extendModel : function(Model) {
        _.extend(Model.prototype, {

        });
        // end extend

        return Model;
    },

    extendCollection : function(Collection) {
        _.extend(Collection.prototype, {

        });
        // end extend

        return Collection;
    }
};