import { useState, useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';
import { Button } from './Button/Button';
import { ErrorMessage } from './ErrorMessage/ErrorMessage';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';
import { SearchBar } from './SearchBar/SearchBar';
import { fetchAPI } from './Services/fetchAPI';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVE: 'resolve',
  REJECTED: 'rejected',
};

export const App = () => {
  const [images, setImages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImg, setModalImg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(Status.IDLE);
  const [totalHits, setTotalHits] = useState('');

  const getInputValue = inputValue => {
    setInputValue(inputValue);
    setImages([]);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (inputValue === '') {
      return;
    }
    currentPage === 1 ? setStatus(Status.PENDING) : scroll.scrollToBottom();

    (async function fetchImages() {
      setStatus(Status.PENDING);
      try {
        let { hits, totalHits } = await fetchAPI(inputValue, currentPage);
        setImages(image => [...image, ...hits]);
        setTotalHits(totalHits);
        setStatus(Status.RESOLVE);
      } catch (error) {
        alert();
      }
    })();
  }, [currentPage, inputValue]);

  const handleIncrementCurrentPage = () => {
    setCurrentPage(page => page + 1);
  };

  const getLargeImageUrl = url => {
    toggleModal();
    setModalImg(url);
  };

  const toggleModal = () => {
    setShowModal(state => !state);
  };

  const endOfHits = currentPage * 12 >= totalHits;

  return (
    <div>
      <SearchBar onSearch={getInputValue} />
      {images.length > 0 && (
        <ImageGallery images={images} onClick={getLargeImageUrl} />
      )}
      {status === 'pending' && <Loader />}
      {status === 'resolve' && !endOfHits && (
        <Button text={'Load more'} onClick={handleIncrementCurrentPage} />
      )}
      {images.length === 0 && status === 'resolve' && (
        <ErrorMessage text="Nothing found" />
      )}
      {status === 'rejected' && <ErrorMessage text="Something went wrong!" />}
      {showModal && <Modal onClose={toggleModal} largeImage={modalImg} />}
    </div>
  );
};
