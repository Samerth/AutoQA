import React from 'react';
export const TestRecorder = ({ onStartRecording, onStopRecording, isRecording }) => {
    return (<div className="test-recorder">
      <h2>Test Recorder</h2>
      <div className="controls">
        {!isRecording ? (<button onClick={onStartRecording} className="start-btn">
            🎥 Start Recording
          </button>) : (<button onClick={onStopRecording} className="stop-btn">
            ⏹️ Stop Recording
          </button>)}
      </div>
      {isRecording && (<div className="recording-indicator">
          🔴 Recording in progress...
        </div>)}
    </div>);
};
