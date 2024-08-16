import React from 'react';

import { Box, ActionList } from '@primer/react';
import {
  KebabHorizontalIcon,
  RepoDeletedIcon,
  TrashIcon,
  CheckIcon,
  PencilIcon,
} from '@primer/octicons-react';
import { PortalWrapper } from '../../core/portalWrapper';

import { getUserFromJWT } from '@helper/helper';

export const ArticleDropdown = ({ setHovering, article, visibility }: any) => {
  const [dropdownState, setDropdownState] = React.useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUserFromJWT();
  let articleOwner = false;
  if (user && (article.Author == user.Username || user.Admin == 'true')) {
    articleOwner = true;
  }

  const actionListStyle = {
    textAlign: 'center',
    fontSize: '14px',
  };

  const handleDelete = async () => {
    try {
      const deleteResponse = await fetch(
        `${backendUrl}/articles/delete?id=${article.ID}&visibility=${visibility}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('verificationToken') || ''
            }`,
          },
        }
      );

      const deleteData = await deleteResponse.json();

      if (deleteData.status == 200) {
        location.reload();
      } else {
        alert('There was a problem while trying to delete the article');
      }
    } catch {
      alert('There was a problem while trying to delete the article');
    }
  };

  const handlePublish = async () => {
    try {
      const publishResponse = await fetch(
        `${backendUrl}/articles/publish?id=${article.ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('verificationToken') || ''
            }`,
          },
        }
      );

      const publishData = await publishResponse.json();

      if (publishData.status == 200) {
        location.reload();
      } else {
        alert('There was a problem while trying to publish the article');
      }
    } catch {
      alert('There was a problem while trying to publish the article');
    }
  };

  const handleUnpublish = async () => {
    try {
      const hideResponse = await fetch(
        `${backendUrl}/articles/hide?id=${article.ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('verificationToken') || ''
            }`,
          },
        }
      );

      const hideData = await hideResponse.json();

      if (hideData.status == 200) {
        location.reload();
      } else {
        alert('There was a problem while trying to unpublish the article');
      }
    } catch {
      alert('There was a problem while trying to unpublish the article');
    }
  };

  const handleEdit = () => {
    window.location.href = `/create?id=${article.ID}`;
  };

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
              transform: 'translateX(-40%)',
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
              {articleOwner && (
                <ActionList.Item onSelect={handleDelete} sx={actionListStyle}>
                  Delete
                  <ActionList.LeadingVisual>
                    <TrashIcon size={20} />
                  </ActionList.LeadingVisual>
                </ActionList.Item>
              )}
              {user.Admin && visibility == 'private' && (
                <ActionList.Item onSelect={handlePublish} sx={actionListStyle}>
                  Publish
                  <ActionList.LeadingVisual>
                    <CheckIcon size={20} />
                  </ActionList.LeadingVisual>
                </ActionList.Item>
              )}
              {articleOwner && visibility == 'private' && (
                <ActionList.Item onSelect={handleEdit} sx={actionListStyle}>
                  Edit
                  <ActionList.LeadingVisual>
                    <PencilIcon size={20} />
                  </ActionList.LeadingVisual>
                </ActionList.Item>
              )}
              {articleOwner && visibility == 'public' && (
                <ActionList.Item
                  onSelect={handleUnpublish}
                  sx={actionListStyle}
                >
                  Unpublish
                  <ActionList.LeadingVisual>
                    <RepoDeletedIcon size={20} />
                  </ActionList.LeadingVisual>
                </ActionList.Item>
              )}
            </ActionList>
          </Box>
        </>
      )}
    </Box>
  );
};
