import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getProfileSchema } from "../../../services/masterDataService";
import Button from "../../../components/ui/Button";
import { Download } from "lucide-react";
import { useProfile } from "../../../hooks/useProfile";
import { useUser } from "../../../context/userContext";

// Static test data
const staticProfile = {
  profile: {
    profileName: "MUSKAN JAIN",
    dob: "05-09-1998",
    salary: null,
    contact_info: "8218842686, 9927054924",
    residence_and_location: "29 ASHAPURAM STADIUM ROAD, BAREILLY (U.P)",
    about_me: "family",
    education: "MBA- HR -SOIL Institute of Management Gurugram",
    professional_history: "HR RECRUITMENT CONSULTANT -RGF GURUGRAM",
    parents_details:
      "Father: ATUL KUMAR JAIN (VICE PRESIDENT -MAHAVEER NIRVAN SAMITI JAIN SAMAJH,BAREILLY ), Occupation: DIRECTOR - VARDHΜΑΝ ASSOCIATES -(A CLASS RAILWAY CONTRACTOR), Mother: RITU JAIN, Occupation: HOME MAKER",
    achievements_and_awards: null,
    other_info: null,
  },
  image: ["/biodata/data/adhar.jfif", "/biodata/data/pan.jfif"],
  profileImage: "/biodata/data/profile.jpg",
  banner_image: "/biodata/data/banner.jfif",
};

const isStatic = true;

const ResumePDF = () => {
  const [profileData, setProfileData] = useState(null);
  const [mainHtml, setMainHtml] = useState("");
  const [footerHtml, setFooterHtml] = useState("");
  const mainRef = useRef(null);
  const footerRef = useRef(null);
  const { getProfileByCid } = useProfile();
  const { userState } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      let profile = userState;
      let config = [];

      if (!isStatic) {
        const schema = await getProfileSchema();
        config = schema.formConfig || [];

        if (!profile?.profile && userState?.pid) {
          profile = await getProfileByCid();
        }
        if (profile?.profile) {
          profile = profile?.profile;
        }
      } else {
        profile = staticProfile;
        config = [
          { name: "profileName", label: "Profile Name" },
          { name: "dob", label: "Date of Birth" },
          { name: "salary", label: "Salary" },
          { name: "residence_and_location", label: "Residence and Location" },
          { name: "about_me", label: "About Me" },
          { name: "education", label: "Education" },
          { name: "professional_history", label: "Professional History" },
          { name: "parents_details", label: "Parents Details" },
        ];
      }

      // Load your HTML template
      const res = await fetch("data/resumeTemplate.html");
      let html = await res.text();

      // Insert details dynamically
      const detailsHtml = config
        .map((field) => {
          const label = field.label || field.name;
          const value = profile.profile[field.name] || "";
          return value
            ? `<p><strong>${label}</strong> : <span>${value}</span></p>`
            : "";
        })
        .join("\n");

      html = html.replace("{{details_fields}}", detailsHtml);

      let documentsHtml = "";
      let documentsClass = "";

      if (Array.isArray(profile.image) && profile.image.length > 0) {
        documentsHtml = profile.image
          .map(
            (img, i) =>
              `<img src="${img}" alt="Document ${i + 1}" class="doc-img" />`
          )
          .join("\n");
        documentsClass = "has-images";
      }

      html = html.replace("{{documents_images}}", documentsHtml);
      html = html.replace("{{documents_class}}", documentsClass);

      Object.keys(profile).forEach((key) => {
        const re = new RegExp(`{{${key}}}`, "g");
        html = html.replace(re, profile[key] || "");
      });

      // Split HTML between main and footer
      const footerStart = html.indexOf('<div class="banner">');
      const mainPart = html.slice(0, footerStart);
      const footerPart = html.slice(footerStart);

      setMainHtml(mainPart);
      setFooterHtml(footerPart);
      setProfileData(profile);
    };

    fetchData();
  }, []);

  const downloadPDF = async () => {
    if (!mainRef.current || !footerRef.current) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const drawBorder = () => {
      pdf.setDrawColor(191, 160, 90);
      pdf.setLineWidth(.5);
      pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);
    };

    const addPageNumber = (num) => {
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      pdf.text(`Page ${num}`, pdfWidth - 25, pdfHeight - 10);
    };

    // Capture the main content
    const mainCanvas = await html2canvas(mainRef.current, {
      scale: 1,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: mainRef.current.scrollWidth,
      windowHeight: mainRef.current.scrollHeight,
    });

    const mainImgData = mainCanvas.toDataURL("image/png");
    const imgWidth = pdfWidth;
    const imgHeight = (mainCanvas.height * pdfWidth) / mainCanvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    pdf.addImage(mainImgData, "PNG", 0, position, imgWidth, imgHeight);
    drawBorder();
    addPageNumber(pageNumber++);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(mainImgData, "PNG", 0, position, imgWidth, imgHeight);
      drawBorder();
      addPageNumber(pageNumber++);
      heightLeft -= pdfHeight;
    }

    // Capture footer (banner + copyright)
    const footerCanvas = await html2canvas(footerRef.current, {
      scale: 2,
      useCORS: true,
    });

    const footerImgData = footerCanvas.toDataURL("image/png");
    const footerImgHeight =
      (footerCanvas.height * pdfWidth) / footerCanvas.width;

    // Place footer at bottom of the last page
    const footerY = pdfHeight - footerImgHeight; // 10mm margin
    pdf.addImage(footerImgData, "PNG", 0, footerY, pdfWidth, footerImgHeight);
    drawBorder();
    addPageNumber(pageNumber - 1);

    pdf.save(`${profileData?.profile?.profileName || "biodata"}.pdf`);
  };

  if (!profileData || !mainHtml || !footerHtml) return <p>Loading...</p>;

  return (
    <>
      <Button variant="ghost" onClick={downloadPDF}>
        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-default-color" />
      </Button>

      {/* Hidden render for PDF capture */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "800px" }}>
        <div ref={mainRef} dangerouslySetInnerHTML={{ __html: mainHtml }} />
        <div ref={footerRef} dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </div>
    </>
  );
};

export default ResumePDF;
