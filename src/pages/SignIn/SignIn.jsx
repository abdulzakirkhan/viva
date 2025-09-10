import { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Logo from "../../assets/svgs/logo.svg";
import LowerImg from "../../assets/svgs/lower.png";
import UpperImg from "../../assets/svgs/upper.svg";
import { useLoginMutation, useResendOtpMutation, useVerifyOtpMutation } from "../../redux/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/auth/authSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import toast from "react-hot-toast";
import { RESEND_OTP } from "../../constants/apiUrls";
const SignInSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(5, "At least 5 characters")
    .required("Password is required"),
});
function SignIn() {
  const [serverError, setServerError] = useState("");
  const [phase, setPhase] = useState("login")
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState(""); // For validation feedback
  const inputsRef = useRef([]);
  const [validEmail, setValidEmail] = useState('')
  const [counter, setCounter] = useState(0);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const dispatch = useDispatch();

  const [login, {error: loginError, isLoading }] = useLoginMutation();
  const [verifyOtp, {error: otpError, isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { error: resendError, isLoading: isResending }] = useResendOtpMutation();

  // const handleSubmit = async (values, { setSubmitting }) => {
  //   try {
  //     const payload={
  //       email: values.email,
  //       password: values.password
  //     }
  //     setValidEmail(values.email)
  //     const res = await login(payload).unwrap();
  //     console.log("res :",res)
  //     if(res?.message === "OTP sent to your email"){
  //       toast.success(res?.message || "OTP sent to your email")
  //       setPhase("otp")
  //       setCounter(60);
  //     }else{
  //       toast.error(res?.message || "Something went wrong")
  //     }
  //     // dispatch(setCredentials({ token, user }));
  //     // toast.success("Login successful!");
  //   } catch (err) {
  //     setServerError(err?.data?.message)
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { email: values.email, password: values.password };
      setValidEmail(values.email);

      const res = await login(payload).unwrap(); // throws on 4xx/5xx

      if (res?.message === "OTP sent to your email") {
        toast.success(res.message);
        setPhase("otp");
        setCounter(60);
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err) {
      // 👇 you'll see server/body here for wrong credentials
      // RTKQ puts server JSON on err.data (e.g. { message: "Invalid credentials" })
      const msg = err?.data?.message || err?.error || "Login failed";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  


  const handleChange = (value, index) => {
  if (/^\d?$/.test(value)) {
    setOtp(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError("");

    // If a digit was entered, move to next field after re-render
    if (value && index < otp.length - 1) {
      requestAnimationFrame(() => {
        const nextEl = inputsRef.current[index + 1];
        if (nextEl && !nextEl.disabled) nextEl.focus();
      });
    }
  }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // prevent cursor moving left in the input
      setOtp(prev => {
        const next = [...prev];
        if (next[index]) {
          // case 1: current has a value → clear it, keep focus here
          next[index] = "";
        } else if (index > 0) {
          // case 2: current empty → move left and clear that one
          next[index - 1] = "";
          requestAnimationFrame(() => {
            inputsRef.current[index - 1]?.focus();
          });
        }
        return next;
      });
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < otp.length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpVerify =async (e) =>{
    e.preventDefault()
    try {
      const payload = {
        email: validEmail,
        otp: otp.join('')
      }
      const res = await verifyOtp(payload).unwrap();
      const { token, user } = res || {}
      // Do something with the token and user
      dispatch(setCredentials({ token, user }));
      toast.success("Login successful!")
    } catch (error) {
      toast.error(error || "Something went wrong")
    }
  }



  // Optional: paste support (paste 6 digits)
  const handlePaste = (e, index) => {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    const digits = text.replace(/\D/g, "").slice(0, otp.length - index).split("");
    if (!digits.length) return;
    e.preventDefault();
    setOtp(prev => {
      const next = [...prev];
      for (let i = 0; i < digits.length; i++) {
        next[index + i] = digits[i];
      }
      return next;
    });

    requestAnimationFrame(() => {
      const focusIndex = Math.min(index + digits.length, otp.length - 1);
      inputsRef.current[focusIndex]?.focus();
    });
  };



 useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [counter]);



  const handleResendOtp = async () => {
    try {
      const payload ={
        email:validEmail
      }
      const response = await resendOtp(payload).unwrap();
      if(response?.message === "A new code has been emailed to you."){
        toast.success(response?.message || "A new code has been emailed to you.")
      }
    } catch (error) {
      toast.error(error || "Something went wrong")
    }
  }

  // console.log("RESEND_OTP :",RESEND_OTP)
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      {/* Left: form card */}
      <section className="flex relative items-center justify-center p-6 lg:p-10">
        <div className="bg-[#FFFFFF]">
          {/* Logo */}
          <div className="">
            <img src={Logo} alt="Logo" className="w-96 h-21" />
          </div>



          {phase === "login" && (
            <div className="flex flex-col gap-8 py-12 items-center">
              <h1 className="font-bold text-3xl text-[#1E1C28]">Sign In</h1>
              <p className="text-[#1E1C28B2] text-center">
                Sign in to continue exploring smarter <br />
                solutions designed just for you
              </p>
            </div>
          )}
          {phase === "otp" && (
            <div className="flex flex-col gap-8 py-12 items-center">
              <h1 className="font-bold text-3xl text-[#1E1C28]">Verify email address</h1>
              <p className="text-[#1E1C28B2] text-center">
                Enter 6 digit code sent to your email <span className="text-[#9C4EDC]"> {validEmail}  <span className="underline cursor-pointer">Edit</span> </span>
              </p>
              <p className="text-[#1E1C28B2] text-center">
                Didn't receive the code? <button onClick={handleResendOtp} disabled={counter > 0}  className={`${counter > 0 ? "cursor-not-allowed" : "text-[#9C4EDC] cursor-pointer"}`}>{counter > 0 ? `Resend in ${counter}s` : "Resend"}</button>
              </p>
            </div>
          )}

          {phase === "login" ? (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={SignInSchema}
            onSubmit={handleSubmit}
            validateOnBlur
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    aria-invalid={touched.email && !!errors.email}
                    className={`w-full rounded-md border px-3 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white
                      ${
                        touched.email && errors.email
                          ? "border-red-400 focus:ring-red-500"
                          : "border-gray-200 focus:ring-purple-600"
                      }`}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type={isShowPassword ? "text" : "password"}
                    placeholder="Password"
                    aria-invalid={touched.password && !!errors.password}
                    className={`w-full rounded-md border px-3 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white
                      ${
                        touched.password && errors.password
                          ? "border-red-400 focus:ring-red-500"
                          : "border-gray-200 focus:ring-purple-600"
                      }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isShowPassword ? (
                      <IoMdEyeOff
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={() => setIsShowPassword(false)}
                      />
                    ) : (
                      <FiEye
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={() => setIsShowPassword(true)}
                      />
                    )}
                  </div>

                  <ErrorMessage
                    name="password"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Server error */}
                {serverError && (
                  <p className="text-sm text-red-600">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-md py-2.5 text-white font-medium transition
                    ${
                      isSubmitting
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 cursor-pointer hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600"
                    }`}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>
          ) : (
            <form onSubmit={handleOtpVerify}>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onPaste={(e) => handlePaste(e,index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}

                    onFocus={() => {
                      const firstEmptyIndex = otp.findIndex(val => val === "");
                      if (firstEmptyIndex !== -1 && firstEmptyIndex !== index) {
                        inputsRef.current[firstEmptyIndex]?.focus();
                      }
                    }}
                    
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "20px",
                      textAlign: "center",
                      borderRadius: "8px",
                      
                      backgroundColor: "#F7F6F9",
                      outline: "none",
                      boxShadow:
                        "0px 2px 6px rgba(0, 0, 0, 0.1), 0px -2px 6px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                ))}
              </div>
              <div className="mt-5 px-5 space-y-2">
                

                <button type="submit"
                  disabled={!otp.every(val => val !== "")}
                  className={`w-full rounded-md py-2.5 font-medium transition 
                    ${otp.every(val => val !== "")
                      ? "bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 cursor-pointer"
                      : "bg-[#1E1C281F] cursor-not-allowed"}`}
                >
                  Verify
                </button>

              </div>
            </form>
          )}

          <footer className="absolute bottom-8 font-medium left-[35%] text-[11px] text-grayCustom text-center">
            © Meeting With Teacher • <a className="underline hover:text-gray-500" href="#">Contact</a> •{" "}
            <a className="underline hover:text-gray-500" href="#">Privacy & Terms</a>
          </footer>
        </div>
      </section>


      {/* RIGHT CARD   */}

      <section className="bg-no-repeat relative max-h-screen bg-center bg-cover p-0" style={{backgroundImage: `url(${LowerImg})`,backgroundSize:"100% 100%"}}>
        <h1 className="absolute top-[40%] left-[27%] font-bold text-6xl text-white">Your Personal AI Interview Coach</h1>
        <img src={UpperImg} alt="" className="w-full h-full object-cover object-left" />
      </section>
    </main>
  );
}
export default SignIn;
