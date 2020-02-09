import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import React from "react";

var footerStyle = {
    backgroundColor: "#F8F8F8",
    borderTop: "1px solid #E7E7E7",
    textAlign: "center",
    padding: "20px",
    position: "fixed",
    left: "0",
    bottom: "0",
    height: "60px",
    width: "100%",
};

export default function Footer() {
    return (
        <div style={footerStyle}>
            <Typography variant="body2" color="textSecondary" align="center">
                {'Copyright © '}
                <Link color="inherit" href="https://ssearch.xyz/">
                    SSEARCH
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        </div>
    );
}