// src/components/Dashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from './chart';

const Dashboard = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch data from the API
        axios.get('http://localhost:5000/api/data')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div className="dashboard">
            <h1>Data Dashboard</h1>
            <Chart data={data} />
        </div>
    );
};

export default Dashboard;
