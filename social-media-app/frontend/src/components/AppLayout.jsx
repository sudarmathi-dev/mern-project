import NavBar from "./NavBar";

const AppLayout = ({ children }) => (
  <>
    <NavBar />
    {children}
  </>
);

export default AppLayout;
