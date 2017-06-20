/**
 * @providesModule ParallaxComposition
 */
'use strict';

var isArray = require('lodash/lang/isArray');
import React, {Component, PropTypes} from 'react';
import {
  Animated,
  ScrollView
} from 'react-native';

var ParallaxImage = require('./ParallaxImage');

var applyPropsToParallaxImages = function(children, props) {
  if(isArray(children)) {
    return children.map(child => {
      if(isArray(child)) {
        return applyPropsToParallaxImages(child, props);
      }
      if(child.type === ParallaxImage) {
        return React.cloneElement(child, props);
      }
      return child;
    });
  }
  if(children.type === ParallaxImage) {
    return React.cloneElement(children, props);
  }
  return children;
};


class ParallaxScrollViewComposition extends Component{
  static propTypes = {
    ...ScrollView.propTypes,
    scrollViewComponent: PropTypes.func,
  };

  constructor(props){
    super(props)
    this.state = {
            scrollY: new Animated.Value(0)
    };
  }

  getScrollResponder() { 
    return this._scrollView.getScrollResponder();
  }

  setNativeProps(props) {
    this._scrollView.setNativeProps(props);
  }

  componentWillMount(){
    this.onParallaxScroll = Animated.event(
      [{ nativeEvent: {contentOffset: {y: this.state.scrollY}} }],
      { useNativeDriver: true }
    );
  }

  render() {
    var { children, scrollViewComponent, onScroll, ...props } = this.props;
    var { scrollY } = this.state;
    var ScrollComponent = scrollViewComponent || Animated.ScrollView;
    var handleScroll = (onScroll
      ? event => { this.onParallaxScroll(event); onScroll(event); }
      : this.onParallaxScroll
    );
    children = children && applyPropsToParallaxImages(children, { scrollY });
    return (
      <ScrollComponent
        scrollEventThrottle={16}
        onScroll={handleScroll}
        ref={function(scrollView) { this._scrollView = scrollView; }.bind(this)}
        {...props}
      >
        {children}
      </ScrollComponent>
    );
  }
};

module.exports = ParallaxScrollViewComposition;
