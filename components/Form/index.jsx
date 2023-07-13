import React, { useContext, useEffect, useState } from "react";
import styles from "./Form.module.sass";
import { upload } from "@spheron/browser-upload";
import cn from "classnames";
import { useRouter } from "next/router";
import { Triangle } from "react-loader-spinner";

import CreateLendContext from "../../context/LendContext";
import Link from "next/link";

const Form = ({ profile }) => {
  const {
    wishlistForm,
    setWishlistForm,
    listClicked,
    setListClicked,
    myNftForm,
    setMyNftForm,
    currentAccount,
    listNftToMarketplace,
    estAmt,
    sentiment,
    setSentiment,
    uploadLink,
    setUploadLink,
    dynamicLink,
    setDynamicLink,
  } = useContext(CreateLendContext);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleListing = async () => {
    const response = await listNftToMarketplace(myNftForm);
    console.log("Handle listing response: ", response);
  };

  // useEffect(() => console.log(myNftForm), [myNftForm]);

  useEffect(() => {
    setMyNftForm({ ...myNftForm, estimatedAmount: estAmt });
  }, [estAmt]);

  const handleSpheronUpload = async () => {
    if (
      myNftForm.owner === "" ||
      myNftForm.nftAddress === "" ||
      myNftForm.tenure === ""
    ) {
      return alert("Insufficient data.");
    }

    const jsonString = JSON.stringify(myNftForm);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], "formdata.json");

    console.log(" -->", file);

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://gainx-backend-spheron.onrender.com/initiate-upload"
      );
      const responseJson = await response.json();
      const uploadResult = await upload([file], {
        token: responseJson.uploadToken,
      });

      setUploadLink(uploadResult.protocolLink);
      setDynamicLink(uploadResult.dynamicLinks[0]);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.list_form}>
      <p style={{ letterSpacing: "0.5px" }}>DETAILS</p>

      <div className={styles.inputs}>
        <div className={styles.input}>
          <p className={styles.label}>NFT Address:</p>
          {profile ? (
            <div>
              <input
                type='text'
                className={styles.prof_input_text}
                placeholder='Enter NFT address'
                id='nftAddress'
                onChange={(e) =>
                  setMyNftForm({ ...myNftForm, nftAddress: e.target.value })
                }
              />
            </div>
          ) : (
            <p className={styles.data}>
              0xb53A165f344827da29f7d489F549a197F18528d1
            </p>
          )}
        </div>

        <div className={styles.input}>
          <p className={styles.label}>NFT Id:</p>
          {profile ? (
            <div>
              <input
                type='number'
                className={styles.prof_input_number}
                placeholder='Enter NFT Id'
                min={0}
                id='nftId'
                onChange={(e) =>
                  setMyNftForm({ ...myNftForm, nftId: e.target.value })
                }
              />
            </div>
          ) : (
            <p className={styles.data}>0001</p>
          )}
        </div>

        <div className={styles.input}>
          <p className={styles.label}>Chain:</p>
          {/* <select
            name='chain'
            id='chain'
            style={{
              borderRadius: "5px",
              padding: "8px",
              backgroundColor: "transparent",
              color: "#fff",
              border: "1px solid #4c5059",
              width: "175px",
              fontWeight: "bold",
            }}
            onChange={(e) =>
              setMyNftForm({ ...myNftForm, chain: e.target.value })
            }
          >
            <option value=''>Select chain</option>
            <option value='fvm'>FVM Hyperspace</option>
            <option value='polygon'>Polygon Mumbai</option>
          </select> */}
          <p style={{ color: "white", fontSize: "15px" }}>XDC Apothem </p>
        </div>

        <div className={styles.input}>
          <p className={styles.label}>Owner:</p>

          <p className={styles.data} id='owner'>
            {currentAccount ? currentAccount : "Wallet not connected."}
          </p>
        </div>

        <div
          className={styles.input}
          style={
            {
              // marginTop: "15px",
              // borderTop: "1px solid #4c5059",
              // borderBottom: "1px solid #4c5059",
              // padding: "8px 0px",
              // marginBottom: "15px",
            }
          }
        >
          <p className={styles.label}>Estimated Amount:</p>
          {/* <input
              type='number'
              id='estimatedAmount'
              className={styles.dataInput}
              onChange={(e) =>
                setMyNftForm({ ...myNftForm, estimatedAmount: e.target.value })
              }
            /> */}
          {profile ? (
            <p>{myNftForm.tenure == "" ? "0" : estAmt}</p>
          ) : (
            <p className={styles.data}>20</p>
          )}
        </div>

        <div className={styles.input}>
          <p className={styles.label}>Sentiment Analysis Score:</p>
          <Link
            href='https://www.rollingstone.com/culture/culture-news/bayc-bored-ape-yacht-club-nft-interview-1250461/'
            rel='noreferrer'
            target='_blank'
          >
            {sentiment < 0 ? (
              <p style={{ fontSize: "16px" }}>Bearish ({sentiment})</p>
            ) : sentiment == 0 ? (
              <p style={{ fontSize: "16px" }}>0</p>
            ) : (
              <p style={{ fontSize: "16px" }}>Bullish ({sentiment})</p>
            )}
          </Link>
        </div>

        <div className={styles.input}>
          <p className={styles.label}>Tenure (In Months):</p>
          <input
            className={styles.dataInput}
            type='number'
            min={1}
            id='tenure'
            onChange={(e) =>
              profile
                ? setMyNftForm({ ...myNftForm, tenure: e.target.value })
                : setWishlistForm({ ...wishlistForm, tenure: e.target.value })
            }
          ></input>
        </div>

        <div className={styles.input}>
          <p className={styles.label}>APY (in %):</p>
          <input
            className={styles.dataInput}
            type='number'
            min={1}
            id='apy'
            onChange={(e) =>
              profile
                ? setMyNftForm({ ...myNftForm, apy: e.target.value })
                : setWishlistForm({ ...wishlistForm, apy: e.target.value })
            }
          ></input>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
          gap: "30px",
        }}
      >
        {isLoading ? (
          <div className='-mr-[50px] ml-[20px] mt-[15px]'>
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
            className={cn("button")}
            style={{ width: "50%", textAlign: "center" }}
            onClick={async () => {
              await handleListing();
              await handleSpheronUpload();
              console.log("🚧 ", myNftForm);
            }}
          >
            List
          </button>
        )}

        {uploadLink && (
          <Link href={uploadLink} rel='noreferrer' target='_blank'>
            <div className={cn("button-stroke button-sm", styles.button)}>
              View Data
            </div>
          </Link>
        )}
        {/* <Link href={uploadLink} rel='noreferrer' target='_blank'>
          <div className={cn("button-stroke button-sm", styles.button)}>
            View Data
          </div>
          {console.log("--> ", uploadLink)}
        </Link> */}
      </div>
    </div>
  );
};

export default Form;
