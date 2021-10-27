import React from 'react';
import { Line } from 'react-chartjs-2';

// Template for Chart.js Line Chart. We can add props to this (data) and call from App.js

const options = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const LineChart = (props) => (
  <div>
    <div className='header'>
      <h1 className='title'>Sentiment Analysis</h1>
    </div>
    <Line data={props.data} options={options} />
  </div>
);

export default LineChart;