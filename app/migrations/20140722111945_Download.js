migration.up = function(db) {
    db.createTable({
        "columns" : {
            "video_id" : "TEXT",
            "video_title" : "TEXT",
            "video_excerpt" : "TEXT",
            "video_provider" : "TEXT",
            "video_url" : "TEXT",
            "video_image_path" : "TEXT"
        },
        "adapter" : {
            "type" : "sql",
            "collection_name" : "downloads"
        }
    });
};

migration.down = function(db) {
    db.dropTable("downloads");
};