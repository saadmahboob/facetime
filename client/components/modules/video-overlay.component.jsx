let ding = new Audio('/audio/ding.mp3');

const {FontIcon, FloatingActionButton, IconButton} = MUI;
const Colors = MUI.Styles.Colors;

const styles = {
  css: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,

    ':hover': {},
  },

  mute: {
    // styles for local mute icon (user mutes a peer)
    css: {
      backgroundColor: 'transparent',
      'float': 'right',
      opacity: 0,
      position: 'absolute',
      right: '5px',
      top: '5px',
      transition: 'opacity 1s ease-in-out',
      zIndex: 3,
    },

    // styles for remote mute icon (peer mutes themself)
    remote: {
      css: {
        bottom: '5px',
        height: '40px',
        padding: 0,
        textShadow: '2px 2px rgba(0, 0, 0, 0.5)',
        top: 'initial',
        width: '40px',
      },
    },

    visible: {
      css: {
        opacity: 1,
      },
    },
  },

  shade: {
    css: {
      backgroundColor: Colors.fullBlack,
      height: '100%',
      opacity: 0,
      transition: 'opacity 1s ease-in-out',
      width: '100%',
      zIndex: 2,
    },

    hover: {
      css: {
        opacity: 0.5,
      },
    },
  },
};

let RTCActions = null;
let RTCStore = null;

Dependency.autorun(()=> {
  RTCStore    = Dependency.get('RTCStore');
  RTCActions  = Dependency.get('RTCActions');
});

VideoOverlayComponent = Radium(React.createClass({
  mixins: [ReactMeteorData],

  componentDidMount() {
    // play ding on entry -- this might get weird if you're the 4th person to enter
    // do you get 4 dings?
    if (this.props.id !== 'local') {
      ding.play();
    }
  },

  getMeteorData() {
    let options = {
      isAudioEnabled: (this.props.id === 'local') ?
        RTCStore.isLocalAudioEnabled.get() :
        RTCStore.isAudioEnabled[this.props.id].get(),
    };

    if (this.props.id !== 'local') {
      options.isRemoteEnabled = RTCStore.isRemoteEnabled[this.props.id].get();
    }
    return options;
  },

  setPrimaryStream() {
    RTCActions.setPrimaryStream(this.props.id);
  },

  toggleAudio() {
    (this.props.id === 'local') ?
      RTCActions.toggleLocalAudio() : RTCActions.toggleAudio(this.props.id);
  },

  render() {
    return (
      <div key='overlay' style={[styles.css]}>
        <div onTouchTap={this.setPrimaryStream} style={[
            styles.shade.css,
            Radium.getState(this.state, 'overlay', ':hover') &&
            styles.shade.hover.css]}>
        </div>
        <FloatingActionButton
          onTouchTap={this.toggleAudio}
          style={_.extend({},
            styles.mute.css,
            (Radium.getState(this.state, 'overlay', ':hover') ||
            !this.data.isAudioEnabled) ?
              styles.mute.visible.css : {})
          }
          mini={true}
          primary={false}>
          <FontIcon
            className='material-icons'
            color={Colors.fullWhite}>mic_off
          </FontIcon>
        </FloatingActionButton>
        <IconButton style={_.extend({},
            styles.mute.css,
            styles.mute.remote.css,
            (this.data.isRemoteEnabled && !this.data.isRemoteEnabled.audio) ?
              styles.mute.visible.css : {})
          }
          mini={true}
          primary={false}>
          <FontIcon
            className='material-icons'
            color={Colors.fullWhite}>mic_off
          </FontIcon>
        </IconButton>
      </div>
    );
  },
}));
