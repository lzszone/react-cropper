import React, {Component, createRef} from 'react';
import Cropper from 'cropperjs';

import '../node_modules/cropperjs';

export default class ReactCropper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cropperRef: createRef(),
    };
    console.log(props.src)
    this.confirm = this.confirm.bind(this);
    this.getBaseRatio = this.getBaseRatio.bind(this);
    this.zoomTo = this.zoomTo.bind(this);
  }

  componentDidMount() {
    const {
      state: {cropperRef},
      props: {aspectRatio = 1}
    } = this;
    const c = new Cropper(cropperRef.current, {
      aspectRatio,
      cropBoxResizable: false,
      dragMode: 'move',
      zoomOnWheel: false,
      ready: () => {
        console.log('ready')
        this.getBaseRatio()
      }
    });
    this.setState({cropper: c})
  }

  componentWillUnmount() {
    this.state.cropper.destroy();
  }

  getBaseRatio() {
    const {
      state: {cropper},
      props: {ratio}
    } = this;
    const {naturalWidth, width} = cropper.getImageData();
    this.setState({baseRatio: width / naturalWidth}, () => this.zoomTo(ratio))
  }

  zoomTo(ratio = 1) {
    const {
      state: {cropper, baseRatio},
    } = this;
    cropper.zoomTo(baseRatio * ratio);
  }

  confirm() {
    const {
      state: {cropper},
      props: {toBlob, toBase64}
    } = this;
    const canvas = cropper.getCroppedCanvas({width: 640, height: 640});
    if(toBase64) {
      const data = canvas.toDataURL('image/jpeg');
      toBase64(data)
    }
    if(toBlob) {
      canvas.toBlob(blob => {
        toBlob(blob)
      }, 'image/jpeg')
    }
    if(!toBase64 && !toBlob) {
      throw new Error('Must specify toBlob or toBase64.')
    }    
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {props, state} = this;
    if(nextProps.src !== props.src) {
      console.log(props.src)
      state.cropper.reset().clear().replace(nextProps.src);
    }
    if(nextProps.ratio !== props.ratio) {
      state.cropper.zoomTo(nextProps.ratio);
    }
    if(nextProps.aspectRatio !== props.aspectRatio) {
      state.cropper.setAspectRatio(nextProps.aspectRatio)
    }
    return false
  }

  render() {
    const {
      state: {cropperRef},
      props: {src}
    } = this;

    return (
      <div style={{height: '100%'}} ><img src={src} alt="img" ref={cropperRef} width='320' /></div>
    )
  }
}