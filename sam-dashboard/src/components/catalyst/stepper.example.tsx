import { Stepper, Step } from './stepper'

export function StepperExamples() {
  return (
    <div className="space-y-16 p-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Horizontal Stepper</h2>
        <Stepper currentStep={2} orientation="horizontal">
          <Step label="Account" description="Create your account" />
          <Step label="Profile" description="Complete your profile" />
          <Step label="Review" description="Review and submit" />
        </Stepper>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Vertical Stepper</h2>
        <Stepper currentStep={2} orientation="vertical">
          <Step label="Account" description="Create your account" />
          <Step label="Profile" description="Complete your profile" />
          <Step label="Review" description="Review and submit" />
        </Stepper>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Without Descriptions</h2>
        <Stepper currentStep={1}>
          <Step label="Step 1" />
          <Step label="Step 2" />
          <Step label="Step 3" />
          <Step label="Step 4" />
        </Stepper>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">All Completed</h2>
        <Stepper currentStep={4}>
          <Step label="Account" description="Create your account" />
          <Step label="Profile" description="Complete your profile" />
          <Step label="Review" description="Review and submit" />
        </Stepper>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">First Step</h2>
        <Stepper currentStep={1}>
          <Step label="Account" description="Create your account" />
          <Step label="Profile" description="Complete your profile" />
          <Step label="Review" description="Review and submit" />
        </Stepper>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Custom Styling</h2>
        <Stepper currentStep={2} className="max-w-2xl mx-auto">
          <Step label="Account" description="Create your account" />
          <Step label="Profile" description="Complete your profile" />
          <Step label="Review" description="Review and submit" />
        </Stepper>
      </section>
    </div>
  )
}

export default StepperExamples
