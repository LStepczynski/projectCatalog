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
import { ConfirmationPopup } from '../confirmationPopup';

import { getUser, fetchWrapper } from '@helper/helper';

export const ArticleDropdown = ({ setHovering, article, visibility }: any) => {
  const [dropdownState, setDropdownState] = React.useState(false);
  const [popupState, setPopupState] = React.useState(false);
  const [popupDetails, setPopupDetails] = React.useState<any>({
    title: '',
    description: '',
    onAccept: null,
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();
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
    setPopupDetails({
      title: 'Delete Article',
      description:
        'Are you sure you want to delete this article? This action cannot be reversed.',
      onAccept: deleteArticle,
    });
    setPopupState(true);
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
    setPopupDetails({
      title: 'Publish Article',
      description: 'Are you sure you want to publish this article?',
      onAccept: publishArticle,
    });
    setPopupState(true);
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
    setPopupDetails({
      title: 'Unpublish Article',
      description:
        'Are you sure you want to unpublish this article? You will loose all of your likes.',
      onAccept: unpublishArticle,
    });
    setPopupState(true);
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
              {user?.Admin && visibility == 'private' && (
                <ActionList.Item onSelect={handlePublish} sx={actionListStyle}>
                  Publish
                  <ActionList.LeadingVisual>
                    <CheckIcon size={20} />
                  </ActionList.LeadingVisual>
                </ActionList.Item>
              )}
              {article.Author == user?.Username && visibility == 'private' && (
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
            <ConfirmationPopup
              title={popupDetails.title}
              description={popupDetails.description}
              onAccept={popupDetails.onAccept}
              onDecline={() => {
                setPopupState(false);
              }}
              isOpen={popupState}
            />
          </Box>
        </>
      )}
    </Box>
  );
};
