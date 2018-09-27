import React, {Component, Fragment} from 'react';
import Cropper from 'cropperjs';

export default class ReactCropper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cropperRef: createRef(),
    };
    this.handleConfirm = this.handleConfirm.bind(this);
    this.getBaseRatio = this.getBaseRatio.bind(this);
    this.zoomTo = this.zoomTo.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  componentDidMount() {
    const {
      state: {cropperRef}
    } = this;
    const c = new Cropper(cropperRef.current, {
      aspectRatio: 1,
      cropBoxResizable: false,
      dragMode: 'move',
      zoomOnWheel: false,
      ready: this.getBaseRatio
    });
    this.setState({cropper: c})
  }

  handleFileChange(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      console.log(arguments);
      const data = reader.result;
      this.setState({src: data}, () => this.getBaseRatio())
    }
  }

  getBaseRatio() {
    const {
      state: {cropper},
      props: {ratio}
    } = this;
    const {naturalWidth, width} = cropper.getImageData();
    this.setState({baseRatio: width / naturalWidth}, () => this.zoomTo(ratio))
  }

  zoomTo(ratio) {
    const {
      state: {cropper, baseRatio},
    } = this;
    cropper.zoomTo(baseRatio * ratio);
  }

  handleConfirm() {
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
        console.log(blob);
        toBlob(blob)
      }, 'image/jpeg')
    }
    if(!toBase64 && !toBlob) {
      throw new Error('Must specify toBlob or toBase64.')
    }    
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {props, state} = this;
    if(nextProps.Button !== props.Button || nextState.src !== state.src) {
      return true
    } else if(nextProps.file !== props.file) {
      return this.handleFileChange(nextProps.file)
    } else if(nextProps.ratio !== props.ratio) {
      return state.cropper.zoomTo(nextProps.ratio);
    } else {
      return false
    }
  }

  render() {
    const {
      props: {Button = button},
      state: {cropperRef, src},
      handleConfirm
    } = this;

    return (
      <Fragment>
        <div style={{height: '100%'}} ><img src={src} alt="img" ref={cropperRef} width='320' /></div>
        <div style={{width: '100%', position: 'fixed', top: 320}} >
          <Button onClick={handleConfirm} >确定</Button>
        </div>
      </Fragment>
    )
  }
}