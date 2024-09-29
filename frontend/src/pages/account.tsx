import React from 'react';

import { Box, Heading, Text, Button, TextInput } from '@primer/react';

import { ProfilePicture } from '../components/contentDisplay/profilePicture';
import { ProfileUploadModal } from '../components/contentDisplay/profileUploadModal';
import { InformationPopup } from '../components/contentDisplay/informationPopup';

import { fetchWrapper, capitalize, getUser, logOut } from '@helper/helper';
import { PortalWrapper } from '../components/core/portalWrapper';

import { useScreenWidth } from '../components/other/useScreenWidth';

export const Account = () => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [pfpHover, setpfpHover] = React.useState<any>(false);
  const [open, setOpen] = React.useState(false);
  const [popupText, setPopupText] = React.useState({
    title: '',
    description: '',
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();

  const screenWidth = useScreenWidth();

  const handleResetPassword = async () => {
    if (user?.Verified != 'true') return;
    if (
      !(
        typeof user.LastPasswordChange == 'number' &&
        user.LastPasswordChange + 15 * 60 < Math.floor(Date.now() / 1000)
      )
    ) {
      setPopupText({
        title: 'Password Reset',
        description: capitalize(
          'you have requested too many password resets. Please try later.'
        ),
      });
      setOpen(true);
      return;
    }

    const response = await fetchWrapper(`${backendUrl}/user/password-reset`, {
      method: 'POST',
    });

    setPopupText({
      title: 'Password Reset',
      description: capitalize(response.response.message),
    });
    setOpen(true);
  };

  const getContainerWidth = () => {
    if (screenWidth < 430) {
      return '270px';
    }
    if (screenWidth < 500) {
      return '300px';
    }
    if (screenWidth < 700) {
      return '450px';
    }
    return '600px';
  };

  if (user == undefined) {
    window.location.href = '/sign-in';
    return <></>;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'center',
        gap: 3,
        mt: '60px',
      }}
    >
      <InformationPopup
        isOpen={open}
        closeFunc={() => setOpen(false)}
        title={popupText.title}
        description={popupText.description}
      />
      <Box
        sx={{
          width: getContainerWidth(),
        }}
      >
        <Box>
          <Heading sx={{ fontSize: screenWidth > 699 ? '32px' : '24px' }}>
            Your Account:
          </Heading>
        </Box>
        <Box
          sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
        ></Box>
        <Box
          sx={{
            display: screenWidth > 499 ? 'flex' : 'grid',
            alignItems: 'center',
            gap: 5,
            m: 5,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              width: screenWidth > 499 ? '' : '100%',
              justifyContent: 'center',
            }}
          >
            <Box
              onMouseEnter={() => setpfpHover(true)}
              onMouseLeave={() => setpfpHover(false)}
              sx={{
                height: screenWidth > 699 ? '170px' : '120px',
                width: screenWidth > 699 ? '170px' : '120px',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <img
                onClick={() => {
                  setUploadModal(true);
                  setpfpHover(false);
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                  opacity: pfpHover ? 0.7 : 0,
                  transition: 'all 0.15s',
                }}
                src="images/plus.webp"
                alt="Add New Icon"
              />
              <ProfilePicture src={user.ProfilePic} />
              <ProfileUploadModal
                endpoint={`${backendUrl}/user/image?username=${user.Username}`}
                isOpen={uploadModal}
                closeFunc={() => setUploadModal(false)}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Text
              sx={{
                fontSize: '22px',
                fontWeight: 'bold',
                textAlign: screenWidth > 499 ? undefined : 'center',
              }}
            >
              {user.Username}
            </Text>
            <Text
              sx={{
                fontSize: '12px',
                textAlign: screenWidth > 499 ? undefined : 'center',
              }}
            >
              {user.Email}
            </Text>
          </Box>
        </Box>

        {user?.Verified != 'true' && (
          <Box sx={{ mt: 7 }}>
            <Text as="p" sx={{ color: 'red', textAlign: 'center' }}>
              This account is not verified. <br></br> Check your inbox for a
              verification email.
            </Text>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Heading sx={{ fontSize: screenWidth > 699 ? '32px' : '24px' }}>
            Security:
          </Heading>
        </Box>
        <Box
          sx={{ width: '100%', height: '1px', backgroundColor: 'ansi.black' }}
        ></Box>
        <Box sx={{ display: 'grid', gap: 6, my: 3 }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Text sx={{ fontSize: '22px' }}>Password:</Text>
            <Box
              sx={{
                display: 'flex',
                flexDirection: screenWidth > 499 ? 'row' : 'column',
                gap: 3,
                justifyContent: 'space-around',
                p: 3,
                borderRadius: '10px',
                backgroundColor: 'canvas.overlay',
              }}
            >
              <ChangePassword />
              <Button onClick={handleResetPassword}>Reset Password</Button>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Text sx={{ fontSize: '22px' }}>Email:</Text>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                py: 3,
                borderRadius: '10px',
                backgroundColor: 'canvas.overlay',
              }}
            >
              <EmailChange />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: '1px',
            backgroundColor: 'ansi.black',
            my: 4,
          }}
        ></Box>
        <Box
          sx={{
            justifyContent: 'space-around',
            display: 'flex',
          }}
        >
          <RemoveAccount />
        </Box>
      </Box>
    </Box>
  );
};

const RemoveAccount = () => {
  // State variables
  const [open, setOpen] = React.useState(false); // Controls the visibility of the modal
  const [popupOpen, setPopupOpen] = React.useState(false); // Controls the visibility of the information popup
  const [password, setPassword] = React.useState(''); // Stores the password input
  const [popupText, setPopupText] = React.useState({
    title: '',
    description: '',
  }); // Stores the popup message
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Indicates if the request is being submitted

  // Backend URL from environment variables
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  /**
   * Handles the account deletion process.
   */
  const handleDeleteAccount = async () => {
    // Input Validation
    if (!password) {
      setPopupText({
        title: 'Error',
        description: 'Password is required to delete your account.',
      });
      setPopupOpen(true);
      return;
    }

    // Optional: Add a confirmation step to prevent accidental deletions
    const confirmDeletion = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmDeletion) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send POST request to delete the account
      const response = await fetchWrapper(`${backendUrl}/user/remove-account`, {
        method: 'POST',
        body: JSON.stringify({
          password,
        }),
      });

      if (response.status === 200) {
        setPopupText({
          title: 'Success',
          description: 'Your account has been successfully deleted.',
        });
        logOut();
      } else {
        // Handle different error messages based on response
        setPopupText({
          title: 'Error',
          description: capitalize(response.response.message),
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setPopupText({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
      setPopupOpen(true);
      // Optionally, close the modal if the operation was successful
      if (popupText.title === 'Success') {
        setOpen(false);
        // Additional cleanup or redirection can be done here
      }
    }
  };

  /**
   * Handles the form submission.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDeleteAccount();
  };

  return (
    <>
      {/* Delete Account Button */}
      <Button
        variant="danger"
        sx={{ fontSize: '16px', p: 3 }}
        onClick={() => setOpen(true)}
      >
        Delete Account
      </Button>

      {/* Modal for Account Deletion */}
      {open && (
        <PortalWrapper>
          <Box
            sx={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'fixed',
              display: 'flex',
              height: '100vh',
              width: '100vw',
              zIndex: 1000,
              left: 0,
              top: 0,
            }}
          >
            {/* Overlay to close the modal when clicked outside */}
            <Box
              onClick={() => setOpen(false)}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                height: '100vh',
                width: '100vw',
                zIndex: -1,
                left: 0,
                top: 0,
              }}
            ></Box>

            {/* Modal Content */}
            <Box
              as="form"
              onSubmit={handleSubmit}
              sx={{
                backgroundColor: 'canvas.default',
                border: 'solid 1px',
                borderColor: 'ansi.black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: '10px',
                position: 'relative',
                width: '330px',
                px: 4,
                gap: 2,
                py: 3,
              }}
            >
              <Text sx={{ fontSize: '22px', textAlign: 'center' }}>
                Delete Account
              </Text>
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'ansi.black',
                  px: 3,
                  my: 2,
                }}
              ></Box>

              {/* Password Input */}
              <Text>Confirm Password:</Text>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />

              {/* Submit Button */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  mb: 2,
                }}
              >
                <Button
                  type="submit"
                  sx={{ width: '40%' }}
                  variant="danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </Box>
            </Box>
          </Box>
        </PortalWrapper>
      )}

      {/* Information Popup */}
      <InformationPopup
        isOpen={popupOpen}
        closeFunc={() => setPopupOpen(false)}
        title={popupText.title}
        description={popupText.description}
      />
    </>
  );
};

const ChangePassword = () => {
  const [open, setOpen] = React.useState(false);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [popupText, setPopupText] = React.useState({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();

  const handleChangePassword = async () => {
    // Input Validation
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPopupText({
        title: 'Error',
        description: 'All fields are required.',
      });
      setPopupOpen(true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPopupText({
        title: 'Error',
        description: 'New password and confirmation do not match.',
      });
      setPopupOpen(true);
      return;
    }

    if (newPassword.length < 8) {
      setPopupText({
        title: 'Error',
        description: 'New password must be at least 8 characters long.',
      });
      setPopupOpen(true);
      return;
    }

    if (
      !(
        typeof user?.LastPasswordChange == 'number' &&
        user.LastPasswordChange + 15 * 60 < Math.floor(Date.now() / 1000)
      )
    ) {
      setPopupText({
        title: 'Password Reset',
        description:
          'You have requested too many password changes. Please try later.',
      });
      setPopupOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWrapper(
        `${backendUrl}/user/change-password`,
        {
          method: 'POST',
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      if (response.status === 200) {
        setPopupText({
          title: 'Success',
          description: 'Your password has been changed successfully.',
        });
        // Optionally, you might want to reset the form fields
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        // Handle different error messages based on response
        setPopupText({
          title: 'Error',
          description: capitalize(response.response.message),
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPopupText({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
      setPopupOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleChangePassword();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Change Password</Button>
      {open && (
        <PortalWrapper>
          <Box
            sx={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'fixed',
              display: 'flex',
              height: '100vh',
              width: '100vw',
              zIndex: 1000,
              left: 0,
              top: 0,
            }}
          >
            <Box
              onClick={() => setOpen(false)}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                height: '100vh',
                width: '100vw',
                zIndex: -1,
                left: 0,
                top: 0,
              }}
            ></Box>
            <Box
              as="form"
              onSubmit={handleSubmit}
              sx={{
                backgroundColor: 'canvas.default',
                border: 'solid 1px',
                borderColor: 'ansi.black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: '10px',
                position: 'relative',
                width: '330px',
                px: 4,
                gap: 2,
                py: 3,
              }}
            >
              <Text sx={{ fontSize: '22px', textAlign: 'center' }}>
                Password Change
              </Text>
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'ansi.black',
                  px: 3,
                  my: 2,
                }}
              ></Box>
              <Text>Old Password:</Text>
              <TextInput
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Text>New Password:</Text>
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Text>Confirm New Password:</Text>
              <TextInput
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  mb: 2,
                }}
              >
                <Button
                  type="submit"
                  sx={{ width: '30%' }}
                  variant="danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </Button>
              </Box>
            </Box>
          </Box>
        </PortalWrapper>
      )}
      <InformationPopup
        isOpen={popupOpen}
        closeFunc={() => setPopupOpen(false)}
        title={popupText.title}
        description={popupText.description}
      />
    </>
  );
};

const EmailChange = () => {
  const [open, setOpen] = React.useState(false);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [popupText, setPopupText] = React.useState({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();

  const handleChangeEmail = async () => {
    // Input Validation
    if (!currentPassword || !newEmail) {
      setPopupText({
        title: 'Error',
        description: 'Current password and new email are required.',
      });
      setPopupOpen(true);
      return;
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setPopupText({
        title: 'Error',
        description: 'Please enter a valid email address.',
      });
      setPopupOpen(true);
      return;
    }

    if (
      !(
        typeof user?.LastEmailChange == 'number' &&
        user.LastEmailChange + 3 * 60 * 60 < Math.floor(Date.now() / 1000)
      )
    ) {
      setPopupText({
        title: 'Password Reset',
        description:
          'You have requested too many email changes. Please try later.',
      });
      setPopupOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWrapper(`${backendUrl}/user/change-email`, {
        method: 'POST',
        body: JSON.stringify({
          password: currentPassword,
          newEmail: newEmail,
        }),
      });

      if (response.status === 200) {
        setPopupText({
          title: 'Success',
          description: 'Verification email sent to your new email address.',
        });
        // Optionally, you might want to reset the form fields
        setCurrentPassword('');
        setNewEmail('');
      } else {
        // Handle different error messages based on response
        setPopupText({
          title: 'Error',
          description: capitalize(response.response.message),
        });
      }
    } catch (error) {
      console.error('Error changing email:', error);
      setPopupText({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
      setPopupOpen(true);
      setOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleChangeEmail();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Change Email</Button>
      {open && (
        <PortalWrapper>
          <Box
            sx={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'fixed',
              display: 'flex',
              height: '100vh',
              width: '100vw',
              zIndex: 1000,
              left: 0,
              top: 0,
            }}
          >
            <Box
              onClick={() => setOpen(false)}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                height: '100vh',
                width: '100vw',
                zIndex: -1,
                left: 0,
                top: 0,
              }}
            ></Box>
            <Box
              as="form"
              onSubmit={handleSubmit}
              sx={{
                backgroundColor: 'canvas.default',
                border: 'solid 1px',
                borderColor: 'ansi.black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: '10px',
                position: 'relative',
                width: '330px',
                px: 4,
                gap: 2,
                py: 3,
              }}
            >
              <Text sx={{ fontSize: '22px', textAlign: 'center' }}>
                Change Email Address
              </Text>
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'ansi.black',
                  px: 3,
                  my: 2,
                }}
              ></Box>
              <Text>Current Password:</Text>
              <TextInput
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Text>New Email Address:</Text>
              <TextInput
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  mb: 2,
                }}
              >
                <Button
                  type="submit"
                  sx={{ width: '30%' }}
                  variant="danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Change Email'}
                </Button>
              </Box>
            </Box>
          </Box>
        </PortalWrapper>
      )}
      <InformationPopup
        isOpen={popupOpen}
        closeFunc={() => setPopupOpen(false)}
        title={popupText.title}
        description={popupText.description}
      />
    </>
  );
};
