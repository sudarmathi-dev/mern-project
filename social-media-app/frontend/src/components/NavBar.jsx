import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import MessageIcon from "./MessageIcon";
import SearchIcon from "./SearchIcon";
import NotificationsDropdown from "./NotificationsDropdown";
import ThemeToggle from "./ThemeToggle";
import "./NavBar.css";

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-mark display">
          threadline
        </Link>
        <div className="navbar-actions">
          <Link to="/search" className="navbar-icon-link" aria-label="Search">
            <SearchIcon />
          </Link>
          <ThemeToggle />
          <Link to="/messages" className="navbar-icon-link" aria-label="Messages">
            <MessageIcon />
          </Link>
          <NotificationsDropdown />
          <Link to={`/profile/${user?.username}`} className="navbar-profile">
            <Avatar src={user?.profilePic} name={user?.username} size={32} />
          </Link>
          <button className="btn btn-ghost navbar-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
