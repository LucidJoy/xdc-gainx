import React, { useState, useContext, useEffect } from "react";
import cn from "classnames";
import styles from "./Withdraw.module.sass";
import Icon from "../Icon";
import TextInput from "../TextInput";
// import Checkbox from "../Checkbox";
import Successfully from "./Successfully";

import CreateLendContext from "../../context/LendContext";

const Withdraw = ({ offer, repay, insurance }) => {
  const { buyInsurance, reedemAmount, setEnded, repayAmount } = useContext(CreateLendContext);

  const [save, setSave] = useState(true);
  const [visibleWithdraw, setVisibleWithdraw] = useState(true);
  const [visibleSuccessfully, setVisibleSuccessfully] = useState(false);

  const handleClick = async () => {
    let response;
    if (offer) {
      response = await reedemAmount();
      console.log("Response to redeem amt: ", response);
    } else if (insurance) {
      response = await buyInsurance();
      console.log("Response to buy insurance: ", response);
    } else if (repay) {
      response = await repayAmount();
      console.log("Response to repay amt: ", response);
    }

    setVisibleWithdraw(false);

    if (response) {
      setVisibleSuccessfully(true);
    } else {
      alert("Error! Try Again!!");
    }
  };

  useEffect(
    () =>
      console.log(`offer: ${offer}, repay: ${repay}, insurance: ${insurance}`),
    []
  );

  // useEffect(() => offer === true && setOffer(false), []);

  return (
    <>
      {visibleWithdraw && (
        <div className={styles.withdraw}>
          <div className={cn("h4", styles.title)}>
            {/* <Icon name='arrow-left' size='32' /> */}
            {offer === true ? "Redeem" : repay === true ? "Repay" : "Insurance"}
          </div>
          <TextInput
            className={styles.field}
            label="Offer Id"
            name="address"
            type="text"
            placeholder="Enter offer ID"
            note=""
            required
          />

          <button
            className={cn("button", styles.button)}
            onClick={() => handleClick()}
          >
            {offer ? "Redeem" : "Buy"}
          </button>
        </div>
      )}

      {visibleSuccessfully && <Successfully />}
    </>
  );
};

export default Withdraw;
