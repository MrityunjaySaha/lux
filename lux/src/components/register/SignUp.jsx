import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { Link } from "react-router-dom";
import PhoneInputComponent from "./PhoneInput"; // Import the PhoneInput component

const SignUp = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [per, setPerc] = useState(null);
  const [role, setRole] = useState(""); // Add state to store the user's selected role
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData((prevData) => ({ ...prevData, [id]: value }));
  };

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setPerc(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  // Function to check if a user with the given phone number already exists
  const checkPhoneNumberExists = async (phoneNumber) => {
    const usersRef = db.collection("Users");
    const querySnapshot = await usersRef.where("number", "==", phoneNumber).get();
    return !querySnapshot.empty;
  };

  const checkEmailExists = async (email) => {
    const usersRef = db.collection("Users");
    const querySnapshot = await usersRef.where("email", "==", email).get();
    return !querySnapshot.empty;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      // Check if a user with the same email already exists
      const emailExists = await checkEmailExists(data.email);

      if (emailExists) {
        setErrorMsg("A user with this email already exists.");
        return; // Exit the function and prevent registration
      }

      // Check if a user with the same phone number already exists
      const phoneNumber = data.phone || ""; // Use an empty string if phone is undefined
      const phoneNumberExists = await checkPhoneNumberExists(phoneNumber);

      if (phoneNumberExists) {
        setErrorMsg("A user with this phone number already exists.");
        return; // Exit the function and prevent registration
      }

      // Continue with user registration
      const { user } = await auth.createUserWithEmailAndPassword(data.email, data.password);
      console.log("User:", user);

      const isAdmin = data.email === "awesomedbz@gmail.com";
      const isSuperAdmin = data.email === "ranmaanimaker@gmail.com";

      // Save user role, image, and password in the database
      if (isAdmin) {
        await db.collection("Users").doc(user.uid).set({
          role: "admin",
          username: data.username,
          displayName: data.displayName,
          email: data.email,
          address: data.address,
          country: data.country,
          img: data.img, // User's image URL
          number: phoneNumber, // User's phone number
          password: data.password, // User's password
          city: data.city, // User's city
          stateOrTerritory: data.stateOrTerritory, // User's state or union territory
          zipCode: data.zipCode, // User's zip code
        });
      } else if (isSuperAdmin) {
        await db.collection("Users").doc(user.uid).set({
          role: "superAdmin",
          username: data.username,
          displayName: data.displayName,
          email: data.email,
          address: data.address,
          country: data.country,
          img: data.img, // User's image URL
          number: phoneNumber, // User's phone number
          password: data.password, // User's password
          city: data.city, // User's city
          stateOrTerritory: data.stateOrTerritory, // User's state or union territory
          zipCode: data.zipCode, // User's zip code
        });
      } else {
        // Regular user
        await db.collection("Users").doc(user.uid).set({
          username: data.username,
          displayName: data.displayName,
          email: data.email,
          address: data.address,
          country: data.country,
          role: role, // Use selected role from dropdown
          img: data.img, // User's image URL
          number: phoneNumber, // User's phone number
          password: data.password, // User's password
          city: data.city, // User's city
          stateOrTerritory: data.stateOrTerritory, // User's state or union territory
          zipCode: data.zipCode, // User's zip code
          timeStamp: serverTimestamp(),
        });

        // Create a STarBank for the user
        const initialBalance = 500;
        const starBankRef = db.collection("STarBank").doc(`STarBank-${user.uid}`);
        await starBankRef.set({
          userId: user.uid,
          balance: initialBalance,
        });
      }

      // Save the user's role in custom claims during signup
      await auth.setCustomUserClaims(user.uid, { role });

      setSuccessMsg("Sign Up Successful!");
      // Clear form inputs
      setData({});
      setRole("");
      setErrorMsg("");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.log("Error signing up:", error.message);
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="new">
      <div className="newContainer">
        <div className="top">
          <h1>{title}</h1>
          <br />
          <h2>Register</h2>
          <div className="bottom">
            {successMsg && (
              <>
                <div className="success-msg">{successMsg}</div>
                <br />
              </>
            )}
            <div className="left">
              <img src={file ? URL.createObjectURL(file) : ""} alt="" />
            </div>
            <div className="right">
              <form onSubmit={handleSignUp}>
                <div className="formInput">
                  <label htmlFor="file">
                    Image: <DriveFolderUploadOutlinedIcon className="icon" />
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </div>

                {inputs.map((input) => (
                  <div className="formInput" key={input.id}>
                    <label>{input.label}</label>
                    <input
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      onChange={handleInput}
                    />
                  </div>
                ))}

                <div className="formInput">
                  <label htmlFor="role">Role:</label>
                  <select
                    className="form-control"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="regularUser">Regular User</option>
                    <option value="business">Business</option>
                    <option value="company">Company</option>
                    <option value="nonprofit">Non-Profit</option>
                    <option value="semiprofit">SemiProfit</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <br />

                {/* Use the PhoneInputComponent for the "Phone" field */}
                <div className="formInput">
                  <label>Phone</label>
                  <PhoneInputComponent
                    value={data.phone}
                    onChange={(value) => setData({ ...data, phone: value })}
                  />
                </div>

                <button disabled={per !== null && per < 100} type="submit">
                  Sign Up
                </button>
                <div className="btn-box">
                  <span>
                    Already have an account?_
                    <Link to="/login" className="link">
                      Here
                    </Link>
                  </span>
                  <br />
                </div>
              </form>
              <br />
              {errorMsg && <div className="Error-msg">{errorMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
