// pages/admin/index.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import AuthWrapper from "../../components/AuthWrapper";
import Layout from "../../components/Layout";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CategoryIcon from "@mui/icons-material/Category";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function AdminPanel() {
  const router = useRouter();
  const drawerWidth = 280;

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, route: "/admin" },
    { text: "Posts", icon: <PostAddIcon />, route: "/admin/posts" },
    { text: "New Post", icon: <PostAddIcon />, route: "/admin/posts/new" },
    { text: "Categories", icon: <CategoryIcon />, route: "/admin/categories" },
    { text: "Bulk Upload", icon: <CloudUploadIcon />, route: "/admin/bulkUpload" },
    { text: "Settings", icon: <SettingsIcon />, route: "/admin/settings" },
  ];

  return (
    <AuthWrapper>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* Static Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              position: 'fixed', // Fixed position
              height: '100vh',
              overflowY: 'auto' // Enable scroll if needed
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#1e293b'
              }}
            >
              Admin Panel
            </Typography>
          </Box>
          
          <Divider sx={{ borderColor: '#f1f5f9' }} />
          
          <List sx={{ px: 2 }}>
            {menuItems.map((item, index) => (
              <ListItem
                button
                key={index}
                onClick={() => router.push(item.route)}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  color: router.pathname === item.route ? '#2563eb' : '#64748b',
                  backgroundColor: router.pathname === item.route ? '#f1f5f9' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    color: '#2563eb'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: router.pathname === item.route ? 600 : 500,
                    fontFamily: '"Outfit", sans-serif'
                  }}
                />
              </ListItem>
            ))}

            {/* Logout Button */}
            <ListItem
              button
              onClick={async () => {
                localStorage.removeItem("token");
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/admin/login");
              }}
              sx={{
                borderRadius: '8px',
                mt: 2,
                color: '#dc2626',
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  fontFamily: '"Outfit", sans-serif'
                }}
              />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            ml: `${drawerWidth}px`, // Add margin equal to drawer width
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            width: `calc(100% - ${drawerWidth}px)` // Set correct width
          }}
        >
          <Typography variant="h4" gutterBottom sx={{
            fontFamily: '"Libre Baskerville", serif',
            fontWeight: 700,
            color: '#1e293b'
          }}>
            Welcome to Admin Panel
          </Typography>
          <Typography paragraph sx={{
            fontFamily: '"Outfit", sans-serif',
            color: '#64748b',
            fontSize: '1.1rem',
            lineHeight: 1.7
          }}>
            Use the navigation on the left to manage your site's content and settings.
          </Typography>
        </Box>
      </Box>
    </AuthWrapper>
  );
}
