import "./navbar.scss"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {auth} from '../../firebase';

const Navbar = () => {
    const {dispatch} = useContext(DarkModeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut().then(()=>{
            navigate('/login');
        })
    }

    return (
        <div className = "navbar">
            <div className = "wrapper">
                <div className = "search">
                    <input type = "text" placeholder = "Search..." />
                    <SearchOutlinedIcon />
                </div>
                <div className = "items">
                    <div className = "item">
                        <LanguageOutlinedIcon className = "icon"/>
                        English
                    </div>
                    <div className = "item">
                        <DarkModeOutlinedIcon className = "icon" onClick = {() => dispatch({type: "TOGGLE"})}/>
                    </div>
                    <div className = "item">
                        <FullscreenExitOutlinedIcon className = "icon"/>
                    </div>
                    <div className = "item">
                        <NotificationsNoneOutlinedIcon className = "icon"/>
                        <div className = "counter">1</div>
                    </div>
                    <div className = "item">
                        <ChatBubbleOutlineIcon className = "icon"/>
                        <div className = "counter">2</div>
                    </div>
                    <div className = "item">
                        <ListOutlinedIcon className = "icon"/>
                    </div>
                    <div className="btn btn-danger btn-md"
                        onClick = {handleLogout}>Logout</div>
                    <div className = "item">
                        <img
                            src = ""
                            alt = ""
                            className = "avatar"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;