import sqlite from 'react-native-sqlite-storage';

const SQLHelper = {
    createTables(database) {
        return database.executeSql(
            'CREATE TABLE items( id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, title TEXT, description TEXT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
        );
    },

    async db() {
        return sqlite.openDatabase({
            name: 'todolist',
            version: 1,
            onCreate: (database) => {
                this.createTables(database);
            },
        });
    },

    async getItems() {
        const db = await this.db();
        const result = await db.executeSql('SELECT * FROM items ORDER BY id');
        return result[0].rows._array;
    },
};

export default SQLHelper;
