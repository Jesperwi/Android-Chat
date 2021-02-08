import React from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { MapView } from 'react-native-maps';
import CustomActions from './CustomActions';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor() {
    super();

    this.state = {
      messages: [],
      uid: 0,
      isConnected: false,
    };

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyDBiw9HcxkieYg04FpvoQryDAj7U2Ht5-E',
        authDomain: 'jw-chat-f1039.firebaseapp.com',
        projectId: 'jw-chat-f1039',
        storageBucket: 'jw-chat-f1039.appspot.com',
        messagingSenderId: '1089230184479',
        appId: '1:1089230184479:web:581fa3509e59c7cd0b752a',
        measurementId: 'G-TE01CF40LR'
      });
      this.referenceChatMessages = firebase.firestore().collection('messages');
    }
  }

  // fetching the netinfo and makes a user
  componentDidMount() {
    this.getMessages();

    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
      } else {
        console.log('offline');
      }
    });

    this.authUnsubscribe = firebase.auth()
      .onAuthStateChanged((user) => {
        if (!user) {
          firebase.auth().signInAnonymously();
        }
        this.setState({
          uid: user && user.uid,
          messages: [],
        });
        this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
      });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe && this.unsubscribe();
  }

  // localstoreage
  async getMessages() {
    try {
      let messages = '';
      messages = await AsyncStorage.getItem('messages') ||  [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  // save the messages on firebase
  async saveMessages() {
    try{
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  // deletemessages on firebase
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  handleConnectivityChange(state) {
    const isConnected = state.isConnected;

    if (isConnected == true) {
      this.setState({
        isConnected: true,
      });
      this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
    } else {
      this.setState({
        isConnected: false,
      });
    }
  }

  // creating the collection on firebase
  onCollectionUpdate(querySnapshot) {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  }

  addMessage() { 
    // add a new list to the collection
    const message = this.state.messages[0];
    this.referenceChatMessages && this.referenceChatMessages.add({
      _id: message._id,
      text: message.text.toString(),
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  }

  // when we send we trigger the onSend to the gifted chat in return
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
    () => {
      this.saveMessages();
      this.addMessage();
    }
    );
  }

  // this code changes the color for the chatbubbles
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{ right: { backgroundColor: '#FF364E' } }}
      />
    );
  }

  // here we render the customAction component inside the chat component
  renderCustomActions(props) {
    return <CustomActions {...props} />;
  }

  renderCustomView(props) {
    const { currentMessage } = props;

    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'grey' }}>{this.state.loggedInText}</Text>
        <GiftedChat 
          messages={this.state.messages}
          renderBubble={this.renderBubble}
          isConnected={this.state.isConnected}
          renderCustomView={this.renderCustomView}  
          renderActions={this.renderCustomActions}  
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.uid,
          }} />
        { Platform.OS === 'android' ? 
          <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'      
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

Chat.propTypes = {
  navigation: {
    setOptions: PropTypes.func,
  },
  route: {
    params: {
      name: PropTypes.string,
    }
  }
};
