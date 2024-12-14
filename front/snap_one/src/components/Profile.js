import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import star_photo from "./images/star.jpg";
import "./Profile.css";

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [averageScore, setAverageScore] = useState(null); // Ortalama puanı tutacak state
  const [photos, setPhotos] = useState([]); // Fotoğrafları tutacak state
  const [file, setFile] = useState(null); // Yüklenecek dosyayı tutacak state
  const [uploadMessage, setUploadMessage] = useState(""); // Yükleme durumu mesajı
  const navigate = useNavigate();

  // Fotoğrafları almak için fonksiyon
  const fetchPhotos = async () => {
    const apiKey = sessionStorage.getItem("apiKey");
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");

    try {
      const response = await fetch(
        `/api/photos/user/${userId}?api=${apiKey}&uname=${username}`
      );
      const data = await response.json();
      if (response.ok) {
        setPhotos(data); // Fotoğraf ID'lerini kaydet
      } else {
        console.error("Error fetching photos:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Kullanıcı bilgilerini ve fotoğrafları almak için useEffect
  useEffect(() => {
    const apiKey = sessionStorage.getItem("apiKey");
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");

    // Eğer gerekli bilgiler yoksa, login sayfasına yönlendir
    if (!apiKey || !username || !userId) {
      navigate("/login");
      return;
    }

    // Kullanıcı bilgilerini state'e kaydet
    setUserInfo({
      userId,
      username,
    });

    // Ortalama puanı almak için API isteği
    const fetchAverageScore = async () => {
      try {
        const response = await fetch(
          `/api/users/${userId}/averageScore?api=${apiKey}&uname=${username}`
        );
        const data = await response.json();
        if (response.ok) {
          setAverageScore(data.averageScore);
        } else {
          console.error("Error fetching average score:", data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    // Fotoğrafları ve puanları almak için çağır
    fetchPhotos();
    fetchAverageScore();
  }, [navigate]);

  // Fotoğraf yükleme işlemi
  // Fotoğraf yükleme işlemi
  const handlePhotoUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    const apiKey = sessionStorage.getItem("apiKey");
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api", apiKey);
    formData.append("uname", username);
    formData.append("ownerId", userId);

    try {
      const response = await fetch(`/api/photos/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadMessage("Photo uploaded successfully!");
        setFile(null);
        // Fotoğraf yüklendikten sonra listeyi güncelle
        fetchPhotos(); // Re-fetch photos after uploading
      } else {
        setUploadMessage("Failed to upload photo.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setUploadMessage("Error occurred while uploading photo.");
    }
  };

  // Fotoğraf silme işlemi
  // Fotoğraf silme işlemi
  const handlePhotoDelete = async (photoId) => {
    const apiKey = sessionStorage.getItem("apiKey");
    const username = sessionStorage.getItem("username");

    try {
      const response = await fetch(
        `/api/photos/${photoId}?api=${apiKey}&uname=${username}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Fotoğraf silindikten sonra listeyi tekrar güncelle
        setPhotos(photos.filter((photo) => photo !== photoId)); // Re-fetch photos after deletion to ensure it's up to date
        setUploadMessage("Photo deleted successfully!");
      } else {
        // Eğer backend'den bir hata dönerse
        const data = await response.json();
        setUploadMessage(`Failed to delete photo: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      setUploadMessage("Error occurred while deleting photo.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Profile Page</h2>
      {userInfo ? (
        <div>
          <h3>Welcome, {userInfo.username}</h3>
          <img
            src={star_photo}
            alt="Profile"
            style={{ width: "150px", height: "150px", borderRadius: "50%" }}
          />
          <p>
            <strong>User ID:</strong> {userInfo.userId}
          </p>
          <p>
            <strong>Username:</strong> {userInfo.username}
          </p>
          {averageScore !== null ? (
            <p>
              <strong>Average Score:</strong> {averageScore}
            </p>
          ) : (
            <p>Loading average score...</p>
          )}

          <h3>Your Photos</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {photos.map((photoId) => (
              <div key={photoId} style={{ position: "relative" }}>
                <img
                  src={`/api/photos/${photoId}?api=${sessionStorage.getItem(
                    "apiKey"
                  )}&uname=${sessionStorage.getItem(
                    "username"
                  )}&timestamp=${new Date().getTime()}`}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => handlePhotoDelete(photoId)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <h3>Upload a Photo</h3>
          <form onSubmit={handlePhotoUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit">Upload</button>
          </form>
          {uploadMessage && <p>{uploadMessage}</p>}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
