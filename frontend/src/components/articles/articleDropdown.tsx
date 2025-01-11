import React from 'react';

import { fetchWrapper } from '@utils/fetchWrapper';
import { getUser } from '@utils/getUser';

import { ShowConfirmationPopup } from '@components/common/popups/confirmationPopup';
import { PortalWrapper } from '@components/common/popups/portalWrapper';

import { Box, ActionList } from '@primer/react';
import {
  KebabHorizontalIcon,
  RepoDeletedIcon,
  TrashIcon,
  CheckIcon,
  CircleSlashIcon,
  PencilIcon,
} from '@primer/octicons-react';

export const ArticleDropdown = ({ setHovering, article, visibility }: any) => {
  const [dropdownState, setDropdownState] = React.useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();
  if (!user) return null;

  const isVerified = user.roles.includes('verified');
  const isOwner = article.author == user.username;
  const isAdmin = user.roles.includes('admin');

  const actionListStyle = {
    textAlign: 'center',
    fontSize: '14px',
  };

  const handleDelete = () => {
    const deleteArticle = async () => {
      try {
        const deleteData = await fetchWrapper(`${backendUrl}/articles/delete`, {
          method: 'DELETE',
          body: JSON.stringify({
            id: article.id,
            visibility: visibility,
          }),
        });

        if (deleteData.status == 'success') {
          sessionStorage.clear();
          location.reload();
        } else {
          alert('There was a problem while trying to delete the article');
        }
      } catch {
        alert('There was a problem while trying to delete the article');
      }
    };
    ShowConfirmationPopup(
      'Delete Article',
      'Are you sure you want to delete this article? This action cannot be reversed.',
      () => {},
      deleteArticle
    );
  };

  const handlePublish = () => {
    const publishArticle = async () => {
      try {
        const publishData = await fetchWrapper(
          `${backendUrl}/articles/publish/${article.id}`,
          {
            method: 'POST',
          }
        );

        if (publishData.status == 'success') {
          sessionStorage.clear();
          location.reload();
        } else {
          alert('There was a problem while trying to publish the article');
        }
      } catch {
        alert('There was a problem while trying to publish the article');
      }
    };
    ShowConfirmationPopup(
      'Publish Article',
      'Are you sure you want to publish this article?',
      () => {},
      publishArticle
    );
  };

  const handleUnpublish = () => {
    const unpublishArticle = async () => {
      try {
        const hideData = await fetchWrapper(
          `${backendUrl}/articles/hide/${article.id}`,
          {
            method: 'POST',
          }
        );

        if (hideData.status == 'success') {
          sessionStorage.clear();
          location.reload();
        } else {
          alert('There was a problem while trying to unpublish the article');
        }
      } catch {
        alert('There was a problem while trying to unpublish the article');
      }
    };
    ShowConfirmationPopup(
      'Unpublish Article',
      'Are you sure you want to unpublish this article? You will lose all of your likes.',
      () => {},
      unpublishArticle
    );
  };

  const handleDecline = () => {
    const unpublishArticle = async () => {
      try {
        const hideData = await fetchWrapper(`${backendUrl}/articles/update`, {
          method: 'PUT',
          body: JSON.stringify({
            id: article.id,
            status: 'Private',
          }),
        });

        if (hideData.status == 200) {
          sessionStorage.clear();
          location.reload();
        } else {
          alert('There was a problem while trying to decline the article');
        }
      } catch {
        alert('There was a problem while trying to decline the article');
      }
    };
    ShowConfirmationPopup(
      'Decline Request',
      'Are you sure you want to decline this article?',
      () => {},
      unpublishArticle
    );
  };

  const handleEdit = () => {
    window.location.href = `/create?id=${article.id}`;
  };

  const dropdownItems = [
    {
      show:
        isVerified &&
        isAdmin &&
        visibility == 'private' &&
        article.status == 'In Review',
      onSelect: handlePublish,
      text:
        window.location.pathname.split('/')[1] == 'adminView'
          ? 'Accept'
          : 'Publish',
      icon: <CheckIcon size={20} />,
    },
    {
      show:
        isVerified &&
        isAdmin &&
        visibility == 'private' &&
        window.location.pathname.split('/')[1] == 'adminView' &&
        article.status == 'review',
      onSelect: handleDecline,
      text: 'Decline',
      icon: <CircleSlashIcon size={20} />,
    },
    {
      show: isVerified && (isOwner || isAdmin),
      onSelect: handleDelete,
      text: 'Delete',
      icon: <TrashIcon size={20} />,
    },
    {
      show: article.author == user.username && visibility == 'private',
      onSelect: handleEdit,
      text: 'Edit',
      icon: <PencilIcon size={20} />,
    },
    {
      show: isVerified && (isOwner || isAdmin) && visibility == 'public',
      onSelect: handleUnpublish,
      text: 'Unpublish',
      icon: <RepoDeletedIcon size={20} />,
    },
  ];

  const counter = (acc: number, current: any) => {
    if (current.show) acc += 1;
    return acc;
  };
  if (dropdownItems.reduce(counter, 0) == 0) return null;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{ p: 1 }}
        onClick={() => {
          setDropdownState(true);
        }}
      >
        <KebabHorizontalIcon size={14} />
      </Box>
      {dropdownState && (
        <>
          <PortalWrapper>
            <Box
              sx={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                top: 0,
                left: 0,
              }}
              onClick={() => {
                setDropdownState(false);
                setHovering(false);
              }}
            ></Box>
          </PortalWrapper>
          <Box
            sx={{
              transform: 'translateX(-70%)',
              backgroundColor: 'canvas.default',
              border: '1px solid',
              borderColor: 'ansi.black',
              position: 'absolute',
              borderRadius: '10px',
              width: 'max-content',
              zIndex: '10',
            }}
          >
            <ActionList>
              {dropdownItems.map((item, index) => {
                if (item.show) {
                  return (
                    <ActionList.Item
                      key={index}
                      onSelect={item.onSelect}
                      sx={actionListStyle}
                    >
                      {item.text}
                      <ActionList.LeadingVisual>
                        {item.icon}
                      </ActionList.LeadingVisual>
                    </ActionList.Item>
                  );
                }
                return null;
              })}
            </ActionList>
          </Box>
        </>
      )}
    </Box>
  );
};
