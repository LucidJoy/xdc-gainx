// ARV
import React, { useContext, useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./AssetBalances.module.sass";

import CreateLendContext from "../../../context/LendContext";

// const items = [
//   {
//     escrowId: 0,
//     apy: "7.46",
//     amount: "50.5678",
//     tenure: "30",
//     insured: "True",
//   }
// ];

// overview page items

const AssetBalances = ({ overview, lender, borrower }) => {
  const {
    listNftToMarketplace,
    borrowerList,
    lenderList,
    ended,
    setEnded,
    getIdToLendingStates,
    ethToUsd,
    glmrToUsd,
  } = useContext(CreateLendContext);

  const [status, setStatus] = useState([]);

  let items,
    statuses = [];

  if (overview) {
    console.log("Overview dashboard");
    items = [...borrowerList, ...lenderList];
  }

  if (lender) {
    console.log("Lender dashboard");
    items = lenderList;
  }

  if (borrower) {
    console.log("Borrower dashboard");
    items = borrowerList;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Offer ID</div>
          <div className={styles.col}>APY</div>
          <div className={styles.col}>Amount</div>
          <div className={styles.col}>Tenure</div>
          <div className={styles.col}>Insured</div>
          <div className={styles.col}>Status</div>
        </div>
        {items.length == 0 ? (
          <p
            style={{
              color: "#ffffff",
              fontSize: "16px",
              padding: "0 16px",
              height: "40px",
              borderRadius: "20px",
              fontWeight: 700,
              paddingTop: "7px",
            }}
          >
            No records found
          </p>
        ) : (
          items.map((x, index) => (
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.currency}>
                  {/* <div className={styles.icon}>
                  <img src={x.icon} alt="Currency" />
                </div> */}
                  <div className={styles.details}>
                    <div className={styles.info}>{`# ${x.escrowId}`}</div>
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                {x.apy && (
                  <div className={cn("category-green", styles.category)}>
                    {`${x.apy} % APY`}
                  </div>
                )}
              </div>
              <div className={styles.col}>
                {/* <div className={styles.info}>{`${(
                  (x.amount * ethToUsd) /
                  glmrToUsd
                ).toFixed(2)} XDC`}</div> */}
                <div className={styles.info} style={{ color: "orange" }}>
                  {x.amount} XDC
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.info}>{`${x.tenure} months`}</div>
              </div>
              <div className={styles.col}>
                <div className={styles.info}>{`${
                  x.isInsuared ? "Insured" : "Not Insured"
                }`}</div>
              </div>
              <div className={styles.col}>
                <div
                  className={`${styles.info} ${
                    ended ? styles.ended : styles.ongoing
                  }`}
                >
                  {console.log("Completed status: ", x.completed)}
                  {x.completed ? "Ended" : "Ongoing"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssetBalances;
