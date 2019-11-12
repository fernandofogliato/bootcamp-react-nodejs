import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

import { Loading } from './styles';

const propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
  }).isRequired,
};

export default class Repository extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('repository').name,
  });

  constructor(props) {
    super(props);
    this.repository = props.navigation.getParam('repository');
    this.isLoading = false;
  }

  renderLoadingView = () => {
    return <Loading />;
  };

  render() {
    return (
      <WebView
        source={{ uri: this.repository.html_url }}
        style={{ flex: 1 }}
        renderLoading={this.renderLoadingView}
        startInLoadingState
      />
    );
  }
}

Repository.propTypes = propTypes;
