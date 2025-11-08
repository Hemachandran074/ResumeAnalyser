import React from 'react'
import Navbar from '~/components/Navbar'
import { useState } from 'react';
import { type FormEvent } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdfToImage';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions, AIResponseFormat } from '../../constants';

const Upload = () => {
    const { auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string; jobTitle: string; jobDescription: string; file: File; }) => {
        setIsProcessing(true);
        setStatusText('Uploading file.....');
        const uploadedFile = await fs.upload([file]);

        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image.....');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image....');
        const uploadedImage = await fs.upload([imageFile.file]);

        if(!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data....');

        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName: jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('ANalyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
        )
        if(!feedback) setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback?.message.content === 'string'
            ?feedback.message.content
            :feedback?.message.content[0].text;
        data.feedback = JSON.parse(feedbackText)
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analysis complete, redirecting...")
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form)return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name');
        const jobTitle = formData.get('job-title');
        const jobDescription = formData.get('job-description');

        if(!file || !companyName || !jobTitle || !jobDescription) return;
        handleAnalyze({ companyName: companyName.toString(), jobTitle: jobTitle.toString(), jobDescription: jobDescription.toString(), file});

    }


  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />

        <section className="main-section">
            <div className='page-heading py-16'>
                <h1>Smart Feedback for your dream job</h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" className='w-full' />
                    </>
                ) : (
                    <h2>Upload your resume and get AI-powered feedback to improve your chances!</h2>
                )}
                {!isProcessing ? (
                    <form id="upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div className='form-div'>
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder='Company Name' id="company-name"></input>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder='Job Title' id="job-title"></input>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-description">Job Description</label>
                            <textarea name="job-description" placeholder='Job Description' id="job-description"></textarea>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="uploader">Upload Resume</label>
                            <FileUploader onFileSelect={handleFileSelect}/>
                        </div>
                        <button className='primary-button' type='submit'>
                            Analyze Resume
                        </button>
                    </form>
                ) : null
                }
            </div>
        </section>
    </main>
  )
}

export default Upload