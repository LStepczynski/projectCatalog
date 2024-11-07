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
  const verified = user?.Verified == 'true' || false;
  let articleOwner = false;
  if (user && (article.Author == user.Username || user.Admin == 'true')) {
    articleOwner = true;
  }

  const actionListStyle = {
    textAlign: 'center',
    fontSize: '14px',
  };

  const handleDelete = () => {
    const deleteArticle = async () => {
      try {
        const deleteData = await fetchWrapper(
          `${backendUrl}/articles/delete?id=${article.ID}&visibility=${visibility}`,
          {
            method: 'DELETE',
          }
        );

        if (deleteData.status == 200) {
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
          `${backendUrl}/articles/publish?id=${article.ID}`,
          {
            method: 'POST',
          }
        );

        if (publishData.status == 200) {
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
          `${backendUrl}/articles/hide?id=${article.ID}`,
          {
            method: 'POST',
          }
        );

        if (hideData.status == 200) {
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
        const hideData = await fetchWrapper(
          `${backendUrl}/articles/?id=${article.ID}&visibility=private`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              key: 'Status',
              value: 'private',
            }),
          }
        );

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
    window.location.href = `/create?id=${article.ID}`;
  };

  const dropdownItems = [
    {
      show:
        verified &&
        user?.Admin &&
        visibility == 'private' &&
        article.Status == 'review',
      onSelect: handlePublish,
      text:
        window.location.pathname.split('/')[1] == 'adminView'
          ? 'Accept'
          : 'Publish',
      icon: <CheckIcon size={20} />,
    },
    {
      show:
        verified &&
        user?.Admin &&
        visibility == 'private' &&
        window.location.pathname.split('/')[1] == 'adminView' &&
        article.Status == 'review',
      onSelect: handleDecline,
      text: 'Decline',
      icon: <CircleSlashIcon size={20} />,
    },
    {
      show: verified && articleOwner,
      onSelect: handleDelete,
      text: 'Delete',
      icon: <TrashIcon size={20} />,
    },
    {
      show: article.Author == user?.Username && visibility == 'private',
      onSelect: handleEdit,
      text: 'Edit',
      icon: <PencilIcon size={20} />,
    },
    {
      show: verified && articleOwner && visibility == 'public',
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
