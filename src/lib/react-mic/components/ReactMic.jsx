import { Component } from 'react';
import PropTypes from 'prop-types';
import { MicrophoneRecorder } from '../libs/MicrophoneRecorder';

export class ReactMic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      microphoneRecorder: null,
      canvas: null,
      canvasCtx: null
    };
  }

  componentDidMount() {
    const {
      onStart,
      onStop,
      onData,
      onBlock,
      audioType,
      sampleRate,
      mimeType,
      echoCancellation,
      autoGainControl,
      noiseSuppression,
      audioBitsPerSecond
    } = this.props;
    const { canvasCtx } = this.state;
    const canvas = this.refs.visualizer;
    const microphoneRecorder = new MicrophoneRecorder(
      onStart,
      onStop,
      onData,
      onBlock,
      audioType,
      sampleRate,
      mimeType,
      echoCancellation,
      autoGainControl,
      noiseSuppression,
      audioBitsPerSecond
    );

    const options = {
      backgroundColor: this.props.backgroundColor,
      strokeColor: this.props.strokeColor,
      visualSetting: this.props.visualSetting
    };

    microphoneRecorder.startMicrophone(canvas, canvasCtx, options);

    this.setState({
      microphoneRecorder: microphoneRecorder,
      canvas: canvas,
      canvasCtx: canvasCtx
    });
  }

  componentDidUpdate(prevProps) {
    const { record } = this.props;
    const { microphoneRecorder } = this.state;

    if (record && !prevProps.record) {
      microphoneRecorder.startRecording();
    } else if (!record && prevProps.record) {
      microphoneRecorder.stopRecording();
    }
  }

  componentWillUnmount() {
    const { microphoneRecorder } = this.state;
    if (microphoneRecorder) {
      microphoneRecorder.stopMicrophone();
    }
  }

  render() {
    const { record, className, width, height } = this.props;
    return (
      <canvas
        ref="visualizer"
        width={width}
        height={height}
        className={className}
        style={{
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)'
        }}
      />
    );
  }
}

ReactMic.propTypes = {
  record: PropTypes.bool,
  className: PropTypes.string,
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  onData: PropTypes.func,
  onBlock: PropTypes.func,
  strokeColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  visualSetting: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  audioType: PropTypes.oneOf(['audio/webm', 'audio/wav']),
  sampleRate: PropTypes.number,
  mimeType: PropTypes.string,
  echoCancellation: PropTypes.bool,
  autoGainControl: PropTypes.bool,
  noiseSuppression: PropTypes.bool,
  audioBitsPerSecond: PropTypes.number,
  timeSlice: PropTypes.number
}

ReactMic.defaultProps = {
  backgroundColor: 'hsla(var(--background) / 0.5)',
  strokeColor: 'hsl(var(--foreground))',
  className: 'visualizer',
  audioBitsPerSecond: 128000,
  mimeType: 'audio/webm;codecs=opus',
  width: 640,
  height: 100,
  record: false,
  visualSetting: 'sinewave',
  echoCancellation: false,
  autoGainControl: false,
  noiseSuppression: false
}

export { ReactMic as default };