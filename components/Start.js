import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Button, TextInput, StyleSheet, ImageBackground } from 'react-native';

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  render() {
    const image = { uri: 'https://i.pinimg.com/originals/bc/47/67/bc47670a93657e3c7bceac136555a818.jpg'};

    return (
      <View className="backgroundStyle" style={styles.container}>
        <ImageBackground source={image} style={styles.image}>
          <View style={{ flex:1, justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.head}>OurChat</Text>
            <TextInput
              style={{height: 40, width: 250, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}}
              onChangeText={(name) => this.setState({name})}
              value={this.state.name}
              placeholder='Type Username Here'
            />
            <View
              style={{
                alignSelf: 'stretch'
              }}
            >
              <Button
                title="Go to Chat" color='#FF364E'
                onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name })} />
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 'auto'
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  head: {
    marginTop: 40,
    fontSize: 40,
    color: '#3F3F3F',
    fontWeight: 'bold',
    justifyContent: 'center'
  },
});

Start.propTypes = {
  navigation: PropTypes.object,
};
