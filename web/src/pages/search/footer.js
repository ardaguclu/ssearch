import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import React from "react";

var footerStyle = {
    backgroundColor: "#3f51b5",
    textAlign: "center",
    color: "#FFFFFF",
    padding: "15px",
    position: "fixed",
    left: "0",
    bottom: "0",
    height: "20px",
    width: "100%",
};

export default function Footer() {
    return (
        <div style={footerStyle}>
            <Typography variant="body2" align="center">
                {'Copyright © '}
                <Link color="inherit" href="https://ssearch.xyz/">
                    SSEARCH
                </Link>{' '}
                {new Date().getFullYear()}
                {'. GNU GPL Licensed.'}
            </Typography>
        </div>
    );
}