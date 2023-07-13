// ARV
import React, { useEffect, useState } from "react";
import cn from "classnames";
// import { Link, Link } from "react-router-dom";
import Link from "next/link";
import styles from "./Wallet.module.sass";
import Icon from "../Icon";
import Modal from "../Modal";
import { useRouter } from "next/router";
import Withdraw from "../Withdraw";
// import Transfer from "../Transfer";

const navigation = [
  {
    title: "Dashboard",
    color: "#23262F",
    url: "/dashboard",
  },
  {
    title: "Lendings", // Margin
    color: "#9757D7",
    url: "/lendings", // wallet-margin
  },
  {
    title: "Borrowings", // Fiat and Spot
    color: "#FFD166",
    url: "/borrowings", // fiat-and-spot
    separator: true,
  },
  // {
  //   title: "Transfer",
  //   icon: "arrow-next",
  // },
  // {
  //   title: "Buy with Fiat",
  //   icon: "wallet",
  //   url: "/buy-crypto",
  // },
  // {
  //   title: "Sell for Fitat",
  //   icon: "sell",
  //   url: "/sell-crypto",
  // },
];

const Wallet = ({ className, children }) => {
  // const { pathname } = useLocation();
  const router = useRouter();
  const [visibleWithdraw, setVisibleWithdraw] = useState(false);
  const [visibleTransfer, setVisibleTransfer] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [offer, setOffer] = useState(false);
  // const [borrowingsPath, setBorrowingsPath] = useState(false);
  const [repay, setRepay] = useState(false);
  const [insurance, setInsurance] = useState(false);

  const activeItem = navigation.find((x) => router.pathname.includes(x.url));

  // useEffect(() => console.log("⛵️ ", router.pathname, activeItem.url), []);

  // useEffect(() => {
  //   router.pathname == "/borrowings"
  //     ? setBorrowingsPath(true)
  //     : setBorrowingsPath(false);

  //   console.log("--> ", borrowingsPath);
  // }, [router.pathname]);

  return (
    <>
      <div
        className={cn(className, styles.wallet)}
        style={{ background: "#22252D" }}
      >
        <div className={styles.sidebar}>
          <div className={cn(styles.group, { [styles.active]: visibleMenu })}>
            <div
              className={styles.top}
              onClick={() => setVisibleMenu(!visibleMenu)}
            >
              <div
                className={styles.bg}
                // style={{ backgroundColor: activeItem.color }}
              ></div>
              {activeItem.title}
            </div>
            <div className={styles.menu}>
              {navigation.map((item, index) =>
                item.url ? (
                  <Link
                    className={styles.sideMenuNA}
                    href={item.url}
                    key={index}
                  >
                    {item.color && (
                      <div
                        className={styles.bg}
                        style={{ backgroundColor: item.color }}
                      ></div>
                    )}
                    {item.icon && <Icon name={item.icon} size='20' />}
                    {item.title}
                  </Link>
                ) : (
                  <button
                    className={cn(styles.item, {
                      [styles.separator]: item.separator,
                    })}
                    key={index}
                    onClick={() => setVisibleTransfer(!visibleTransfer)}
                  >
                    {item.icon && <Icon name={item.icon} size='20' />}
                    {item.title}
                  </button>
                )
              )}
            </div>
          </div>
          <div className={styles.btns}>
            {/* <Link
              className={cn("button button-small", styles.button)}
              to="/deposit-fiat"
            >
              Deposit
            </Link> */}
            {router.pathname === "/borrowings" ? (
              <button
                className={cn("button", styles.button)}
                onClick={() => {
                  setVisibleWithdraw(!visibleWithdraw);
                  setRepay(true);
                }}
              >
                Repay Offer
              </button>
            ) : (
              <button
                className={cn("button", styles.button)}
                onClick={() => {
                  setVisibleWithdraw(!visibleWithdraw);
                  setOffer(true);
                }}
              >
                Redeem Offer
              </button>
            )}

            <button
              className={cn("button", styles.button)}
              onClick={() => {
                setVisibleWithdraw(!visibleWithdraw);
                setInsurance(true);
              }}
            >
              Buy Insurance
            </button>
            <button
              className={cn("button-stroke button-small", styles.button)}
              onClick={() => setVisibleTransfer(!visibleTransfer)}
            >
              Transfer
            </button>
          </div>
        </div>

        <div className={styles.wrapper}>{children}</div>
      </div>

      {offer ? (
        <Modal
          visible={visibleWithdraw}
          onClose={() => {
            setVisibleWithdraw(false);
            setOffer(false);
          }}
        >
          <Withdraw offer={offer} />
        </Modal>
      ) : repay ? (
        <Modal
          visible={visibleWithdraw}
          onClose={() => {
            setVisibleWithdraw(false);
            setRepay(false);
          }}
        >
          <Withdraw repay={repay} />
        </Modal>
      ) : (
        <Modal
          visible={visibleWithdraw}
          onClose={() => {
            setVisibleWithdraw(false);
            setInsurance(false);
          }}
        >
          <Withdraw insurance={insurance} />
        </Modal>
      )}

      {/* {offer && (
        <Modal
          visible={visibleWithdraw}
          onClose={() => {
            setVisibleWithdraw(false);
            setOffer(false);
          }}
        >
          <Withdraw offer={offer} />
        </Modal>
      )}

      {repay && (
        <Modal
          visible={visibleWithdraw}
          onClose={() => {
            setVisibleWithdraw(false);
            setRepay(false);
          }}
        >
          <Withdraw repay={repay} />
        </Modal>
      )} */}

      {/* 
      <Modal
        visible={visibleWithdraw}
        onClose={() => setVisibleWithdraw(false)}
        setOffer={setOffer}
      >
        <Withdraw offer />
      </Modal> */}
      {/* <Modal
        visible={visibleTransfer}
        onClose={() => setVisibleTransfer(false)}
      >
        <Transfer />
      </Modal> */}
    </>
  );
};

export default Wallet;
