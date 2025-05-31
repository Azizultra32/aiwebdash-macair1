import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isError } from '@/utils/error';

const degreeOptions = [
  'MD (Doctor of Medicine)',
  'DDS (Doctor of Dental Surgery)',
  'DMD (Doctor of Medicine in Dentistry or Doctor of Dental Medicine)',
  'DO (Doctor of Osteopathic Medicine)',
  'ND (Doctor of Naturopathic Medicine)',
  'NP (Nurse Practitioner)',
  'RN (Registered Nurse)',
  'LPN (Licensed Practical Nurse)',
  'OD (Doctor of Optometry)',
  'BSN (Bachelor of Science in Nursing)',
  'MSN (Master of Science in Nursing)',
  'DC (Doctor of Chiropractic)',
  'DPT (Doctor of Physical Therapy)',
  'DPM (Doctor of Podiatric Medicine)',
  'PharmD (Doctor of Pharmacy)',
  'BPharm (Bachelor of Pharmacy)',
  'RD (Registered Dietitian)',
  'CNM (Certified Nurse Midwife)',
  'MPH (Master of Public Health)',
  'Other',
];

const areasOfPractice = [
  {
    heading: 'General and Primary Care',
    options: ['Primary Care (Family Medicine, General Practice)'],
  },
  {
    heading: 'Allied Care',
    options: [
      'Acupuncture',
      'Dentistry (General)',
      'Dental Surgery and Subspecialties',
      'Lactation',
      'Lifestyle Medicine & Health',
      'Midwifery',
      'Naturopathy',
      'Nurse Practitioner',
      'Nursing',
      'Physiotherapy',
      'Pharmacist',
      'Podiatry',
      'Traditional Chinese Medicine',
    ],
  },
  {
    heading: 'Specialized Medicine',
    options: [
      'Addiction Medicine & Substance Use Disorders',
      'Adolescent and Young Adult Medicine',
      'Allergy and Immunology',
      'Anesthesiology',
      'Cardiology (including Interventional Cardiology)',
      'Critical Care Medicine',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Geriatrics',
      'Hematology',
      'Hepatology',
      'Hospitalist & Hospital Medicine',
      'Infectious Diseases',
      'Nephrology',
      'Neurology',
      'Oncology',
      'Otolaryngology (ENT)',
      'Palliative Care',
      'Pain Medicine',
      'Psychiatry',
      'Respirology & Pulmonary Medicine',
      'Rheumatology',
      'Sports Medicine',
      'Vascular Medicine',
    ],
  },
  {
    heading: 'Surgical Specialties',
    options: [
      'General Surgery',
      'Bariatrics',
      'Neurosurgery',
      'Obstetrics/Gynecology',
      'Ophthalmology',
      'Oral Surgery',
      'Orthopedics',
      'Plastic Surgery',
      'Urology',
      'Vascular Surgery',
    ],
  },
  {
    heading: 'Mental and Behavioral Health',
    options: [
      'Geriatric Psychiatry',
      'Counseling (All Disciplines)',
      'Doctorate Psych',
    ],
  },
  {
    heading: 'Diagnostic and Forensic Medicine',
    options: [
      'Forensic Medicine',
      'Genetics',
      'Pathology',
      'Radiology (including Interventional Radiology)',
    ],
  },
  {
    heading: 'Public Health and Community Care',
    options: ['Public Health', 'Social Worker'],
  },
  {
    heading: 'Emerging Fields & Special Interest',
    options: [
      'Telemedicine',
      'Genomic Medicine',
      'Obesity Medicine',
      'Integrative Medicine',
      'Travel Medicine',
      'Hyperbaric Medicine',
      'Injection & Infusion Medicine',
      'Anti-Aging Medicine',
      'Psychedelic & Cannabinoid Medicine',
    ],
  },
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: currentYear - 1944 }, (_, i) =>
  (currentYear - i).toString()
);

const hearAboutUsOptions = [
  'Colleague recommendation',
  'Adopted by your practice',
  'Google search',
  'AI-related website',
  'Advertising',
  'Professional association',
  'Conference or event',
  'Social media',
  'Medical journal or publication',
  'Other',
];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(1, "Phone number is required"),
  degree: z.string().min(1, "Degree is required"),
  otherDegree: z.string().optional(),
  yearGraduated: z.string().min(1, "Year graduated is required"),
  areaOfService: z.string().min(1, "Area of service is required"),
  countryOfService: z.string().min(1, "Country of service is required"),
  regionOfLicense: z.string().min(1, "Region of license is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  hearAboutUs: z.string().min(1, "This field is required"),
  otherHearAboutUs: z.string().optional(),
  referralEmail: z.string().optional(),
  termsAndConditions: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Conditions.",
  }),
});

const FormRegister = () => {
  const {
    register: { mutateAsync: register },
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      degree: '',
      otherDegree: '',
      yearGraduated: '',
      areaOfService: '',
      countryOfService: '',
      regionOfLicense: '',
      licenseNumber: '',
      hearAboutUs: '',
      otherHearAboutUs: '',
      referralEmail: '',
      termsAndConditions: false,
    },
  });

  const { isSubmitting } = useFormState({
    control: form.control,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await register(values);
      navigate('/login');
    } catch (error: unknown) {
      toast({
        description: isError(error) ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="text-center mb-6">
            
              <h2 className="text-2xl font-semibold mt-4">Create Your Account</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your highest medical degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {degreeOptions.map((degree) => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('degree') === 'Other' && (
              <FormField
                control={form.control}
                name="otherDegree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Degree</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="yearGraduated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Graduated</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your graduation year" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduationYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaOfService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area of Service</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your primary area of practice" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasOfPractice.map((area) => (
                        <React.Fragment key={area.heading}>
                          <SelectItem value={area.heading} disabled className="font-bold">
                            {area.heading}
                          </SelectItem>
                          {area.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="countryOfService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Service</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regionOfLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region of License</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hearAboutUs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How Did You Hear About Us?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select how you discovered Assist MD" />
                    </SelectTrigger>
                    <SelectContent>
                      {hearAboutUsOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('hearAboutUs') === 'Other' && (
              <FormField
                control={form.control}
                name="otherHearAboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify how you heard about us</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="referralEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Email (Pay It Forward | Believer Programs)</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I agree to the Terms & Conditions</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6"
            >
              {isSubmitting ? "Creating Account..." : "Submit Registration"}
            </Button>

            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <img
                src="/assistmdlogo.jpeg"
                alt="AssistMD Logo"
                className="w-56 mx-auto h-10"
              />
              <p className="mt-4 text-sm text-gray-600">
                <span className="mr-4">All Rights Reserved.</span>
                <br />
                <small>Assist MD 2024 Armada Health Technologies</small>
                <br />
                <small>A Division of Armada Healthcare Technologies Limited</small>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FormRegister;
