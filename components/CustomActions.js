import React from 'react';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default class CustomActions extends React.Component {
  // this code lets the user pick an image they want to send with permission access
  async imagePicker() {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

    try {
      if(status === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
        }).catch(error => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          console.log('imgae', (result.uri));
          this.props.onSend({ image: imageUrl });
        }  
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // here we can upload pictures to our firebase database
  async uploadImageFetch() {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const imageNameBefore = uri.split('/');
    const imageName = imageNameBefore[imageNameBefore.length - 1];

    const ref = firebase.storage().ref().child(`images/${imageName}`);
    const snapshot = await ref.put(blob);
      
    blob.close();

    return await snapshot.ref.getDownloadURL();
  }

  // take photo with the camera with asking permission
  async takePhoto() {
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.MEDIA_LIBRARY,
    );
    try {
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // get location and ask permission through async 
  async getLocation() {
    try {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);

      if (status === 'granted') {
        const result = await Location
          .getCurrentPositionAsync({})
          .catch((error) => console.log(error));
        // const longitude = JSON.stringify(result.coords.longitude);
        // const altitude = JSON.stringify(result.coords.latitude);

        if (result) {
          // actionSheetRef.current?.setModalVisible(false);
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  onActionPress() {
    const options = [
      'Choose From Library',
      'Take Picture',
      'Send Location',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
        case 0:
          console.log('user wants to pick an image');
          return this.imagePicker();
        case 1:
          console.log('user wants to take a photo');
          return this.takePhoto();
        case 2:
          console.log('user wants to get their location');
          return this.getLocation();
        }
      }
    );
  }

  render() {
    return(
      <TouchableOpacity style={[styles.container]} onPress={this.onActionPress}>
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: 'white',
    borderWidth: 2,
    flex: 1,
    backgroundColor: '#FF364E',
  },
  iconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomActions.propTypes = {
  iconTextStyle: PropTypes.object,
  onSend: PropTypes.func,
  wrapperStyle: PropTypes.object,
};
