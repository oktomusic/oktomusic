import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      containerClassName="okto-toast-container"
      toastOptions={{
        className: "okto-toast",
      }}
    ></Toaster>
  );
}
