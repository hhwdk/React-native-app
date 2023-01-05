import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    SafeAreaView,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback,
    Button,
    Alert,
    Pressable,
} from 'react-native';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';
import {
    AppBar,
    IconButton,
    Stack,
    FAB,
    TextInput,
} from '@react-native-material/core';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

function openDatabase() {
    if (Platform.OS === 'web') {
        return {
            transaction: () => {
                return {
                    executeSql: () => {},
                };
            },
        };
    }

    const db = SQLite.openDatabase('db.db');
    return db;
}

const db = openDatabase();

function Items({ done: doneHeading, onPressItem }) {
    const [items, setItems] = useState(null);
    const [forceUpdate, forceUpdateId] = useForceUpdate();

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                `select * from items;`,
                [doneHeading ? 1 : 0],
                (_, { rows: { _array } }) => setItems(_array)
            );
        });
    }, []);

    if (items === null || items.length === 0) {
        return null;
    }
    const deleteItem = (id) => {
        db.transaction((tx) => {
            tx.executeSql(
                `delete from items where id = ?;`,
                [id],
                (_, result) => {
                    console.log(result);
                    forceUpdate();
                }
            );
        });
    };

    function someMethod() {
        // Force a render with a simulated state change
        this.setState({ state: this.state });
    }
    return (
        <View style={styles.listOfItems}>
            {items.map(({ id, done, value }) => (
                <View style={styles.items}>
                    <Text
                        key={id}
                        style={
                            ({ color: done ? '#fff' : '#000' },
                            styles.buttonText)
                        }>
                        {value}, {id}
                    </Text>

                    <View style={styles.buttons}>
                        {/* <IconButton
                            icon={(props) => <Icon name="pencil" {...props} />}
                            onPress={() => onPressItem && onPressItem(id)}
                        /> */}
                        <IconButton
                            icon={(props) => <Icon name="delete" {...props} />}
                            onPress={() => onPressItem && deleteItem(id)}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
}

export default function App() {
    const [text, setText] = useState('');
    const [forceUpdate, forceUpdateId] = useForceUpdate();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalText, setModalText] = useState('');

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'create table if not exists items (id integer primary key not null, done int, value text);'
            );
        });
    }, []);

    const add = (text) => {
        if (text === null || text === '') {
            return false;
        }

        db.transaction(
            (tx) => {
                tx.executeSql('insert into items (done, value) values (0, ?)', [
                    text,
                ]);
                tx.executeSql('select * from items', [], (_, { rows }) =>
                    console.log(JSON.stringify(rows))
                );
            },
            null,
            forceUpdate,
            () => setModalText('')
        );
    };
    return (
        <View style={styles.container}>
            <View style={styles.container2}>
                <SafeAreaView style={{ backgroundColor: '#607d8b' }}>
                    <AppBar
                        title="To-do list"
                        color="#607d8b"
                        tintColor="white"
                        elevation={0}
                    />
                </SafeAreaView>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={modalVisible}
                    style={{ marginTop: 22 }}
                    onRequestClose={() => {
                        setModalVisible(false);
                    }}>
                    <View style={{ marginTop: 220 }}>
                        <View style={{ backgroundColor: '#fff', padding: 20 }}>
                            <TextInput
                                style={styles.input}
                                onChangeText={setModalText}
                                value={modalText}
                                placeholder="Enter an item"
                                autoFocus={true}
                                onSubmitEditing={() => {
                                    add(modalText);
                                    setModalText('');
                                    setModalVisible(false);
                                }}
                            />
                            <Button
                                onPress={() => {
                                    setModalVisible(false);
                                }}
                                title="Cancel"
                            />
                        </View>
                    </View>
                </Modal>
                <ScrollView style={styles.listWrapper}>
                    <Items
                        key={`forceupdate-todo-${forceUpdateId}`}
                        onPressItem={(id) =>
                            db.transaction(
                                (tx) => {
                                    tx.executeSql(
                                        `delete items  where id = ?;`,
                                        [id]
                                    );
                                },
                                null,
                                forceUpdate
                            )
                        }
                    />
                    {/*  <Items
                        done
                        key={`forceupdate-done-${forceUpdateId}`}
                        onPressItem={(id) =>
                            db.transaction(
                                (tx) => {
                                    tx.executeSql(
                                        `delete from items where id = ?;`,
                                        [id]
                                    );
                                },
                                null,
                                forceUpdate
                            )
                        }
                    /> */}
                </ScrollView>

                <Stack fill center style={styles.floatingActionButton}>
                    <FAB
                        icon={(props) => <Icon name="plus" {...props} />}
                        color="#607d8b"
                        tintColor="white"
                        onPress={() => setModalVisible(true)}
                    />
                </Stack>
            </View>
        </View>
    );
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return [() => setValue(value + 1), value];
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#607d8b',
    },
    input: {
        height: 40,
        margin: 12,
        marginHorizontal: 15,
    },
    container2: {
        backgroundColor: 'white',
        flex: 1,
    },
    floatingActionButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 20,
        marginBottom: 48,
    },
    inner: {
        padding: 24,
        flex: 1,
        justifyContent: 'space-around',
    },
    header: {
        fontSize: 36,
        marginBottom: 48,
    },
    textInput: {
        height: 40,
        borderColor: '#000000',
        borderBottomWidth: 1,
        marginBottom: 36,
    },
    btnContainer: {
        backgroundColor: 'white',
        marginTop: 12,
    },
    listOfItems: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 15,
    },
    items: {
        backgroundColor: '#ffcc80',
        padding: 12,
        marginVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        padding: 12,
        fontSize: 16,
        flex: 1,
    },
});
