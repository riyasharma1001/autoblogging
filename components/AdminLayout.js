import React from "react";
import { useRouter } from "next/router";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
} from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';

const drawerWidth = 280;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [openPost, setOpenPost] = React.useState(true);
  const [openSettings, setOpenSettings] = React.useState(false);

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin",
    },
    {
      text: "Posts",
      icon: <ArticleIcon />,
      subitems: [
        { text: "All Posts", icon: <ArticleIcon />, path: "/admin/posts" },
        { text: "New Post", icon: <PostAddIcon />, path: "/admin/posts/new" },
        { text: "Categories", icon: <CategoryIcon />, path: "/admin/categories" },
        { text: "Bulk Upload", icon: <CloudUploadIcon />, path: "/admin/posts/bulk-upload" } // Updated path
      ]
    },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      subitems: [
        { text: "General Settings", icon: <SettingsIcon />, path: "/admin/settings" },
        { text: "Security", icon: <SecurityIcon />, path: "/admin/security" },
        { text: "Analytics", icon: <AnalyticsIcon />, path: "/admin/analytics" }
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
            <React.Fragment key={index}>
              {item.subitems ? (
                <>
                  <ListItem
                    button
                    onClick={() => item.text === "Posts" ? setOpenPost(!openPost) : setOpenSettings(!openSettings)}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      color: '#64748b',
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
                        fontWeight: 500,
                        fontFamily: '"Outfit", sans-serif'
                      }}
                    />
                    {item.text === "Posts" ? 
                      (openPost ? <ExpandLess /> : <ExpandMore />) :
                      (openSettings ? <ExpandLess /> : <ExpandMore />)
                    }
                  </ListItem>
                  <Collapse 
                    in={item.text === "Posts" ? openPost : openSettings} 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subitems.map((subitem, subindex) => (
                        <ListItem
                          button
                          key={subindex}
                          onClick={() => router.push(subitem.path)}
                          sx={{
                            pl: 4,
                            borderRadius: '8px',
                            mb: 0.5,
                            color: router.pathname === subitem.path ? '#2563eb' : '#64748b',
                            backgroundColor: router.pathname === subitem.path ? '#f1f5f9' : 'transparent',
                            '&:hover': {
                              backgroundColor: '#f8fafc',
                              color: '#2563eb'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                            {subitem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subitem.text}
                            primaryTypographyProps={{
                              fontSize: '0.95rem',
                              fontWeight: router.pathname === subitem.path ? 600 : 500,
                              fontFamily: '"Outfit", sans-serif'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem
                  button
                  onClick={() => router.push(item.path)}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    color: router.pathname === item.path ? '#2563eb' : '#64748b',
                    backgroundColor: router.pathname === item.path ? '#f1f5f9' : 'transparent',
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
                      fontWeight: router.pathname === item.path ? 600 : 500,
                      fontFamily: '"Outfit", sans-serif'
                    }}
                  />
                </ListItem>
              )}
            </React.Fragment>
          ))}

          {/* Logout Button */}
          <ListItem
            button
            onClick={handleLogout}
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
          backgroundColor: '#f8fafc',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}