import React, { useState, useContext } from "react";
import cn from "classnames";
import axios from "axios";
import { Triangle } from "react-loader-spinner";

import LineChart from "../Charts/LineChart";
import styles from "./PageAnalytics.module.sass";
import { SalesData } from "../../constants/chartData";
import CreateLendContext from "../../context/LendContext";

const PageAnalytics = () => {
  const { graphPrompt, setGraphPrompt } = useContext(CreateLendContext);
  const allSalesData = SalesData.map((data) => data);
  const [isPrompt, setIsPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [days, setDays] = useState([]);

  // for (let i = 1; i <= results.length; i++) {
  //   days.push(i);
  // }

  const [graphData, setGraphData] = useState({
    labels: null,
    datasets: [
      {
        label: "Graph",
        data: null,
        borderColor: "#E45F35",
        tension: 0.1,
        fill: false,
      },
    ],
  });

  const handlePrompt = async () => {
    setLoading(true);
    const url =
      "https://msg-pre-process.onrender.com/predictions/contract_address=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

    const requestBody = {
      message: graphPrompt,
    };
    console.log(requestBody);

    try {
      const response = await axios.post(url, requestBody);
      setResults(response.data);
      console.log("axios res -> ", response.data);
      setIsPrompt(true);
      let temp = [];
      console.log(response.data.values.length);

      //"message": "what can be number of active user after 0.25 months"

      for (let i = 1; i <= response.data.values.length; i++) {
        temp.push(i);
      }
      setDays(temp);

      setGraphData((prevGraphData) => ({
        ...prevGraphData,
        labels: temp.map((val) => val),
        datasets: [
          {
            ...prevGraphData.datasets[0],
            data: response.data.values, // Use the correct data source here (results or response.data.values)
          },
        ],
      }));
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className={styles.main} style={{ marginTop: "-45px" }}>
      <div className={cn("container", styles.container)}>
        <p className={styles.heading}>Analytics</p>

        <div className={styles.promptDiv}>
          <p onClick={() => console.log(graphData.labels, graphData.datasets)}>
            Enter your prompt
          </p>
          <textarea
            cols='30'
            rows='10'
            placeholder='Enter prompt to generate graph'
            onChange={(e) => setGraphPrompt(e.target.value)}
          />

          {loading ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "50px",
              }}
            >
              <Triangle
                height='30'
                width='30'
                color='#EE652A'
                ariaLabel='triangle-loading'
                wrapperStyle={{}}
                wrapperClassName=''
                visible={true}
              />
            </div>
          ) : (
            <button
              className={cn("button-stroke button-sm", styles.buttonHome)}
              style={{
                borderColor: "#E45F35",
                color: "#fff",
                backgroundColor: "#1F2127",
              }}
              onClick={() => handlePrompt()}
            >
              Submit
            </button>
          )}
        </div>

        {/* isPrompt */}
        {graphData.labels !== null && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "1000px",
                // background: "#fff",
                border: "2px solid #353945",
                borderRadius: "10px",
                padding: "30px",
              }}
            >
              <LineChart chartData={graphData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageAnalytics;
