import { Avatar } from './avatar'
import { AvatarGroup } from './avatar-group'

export function AvatarGroupExamples() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Basic Avatar Group</h3>
        <AvatarGroup>
          <Avatar initials="AB" alt="Alice Brown" />
          <Avatar initials="CD" alt="Charlie Davis" />
          <Avatar initials="EF" alt="Emma Foster" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Avatar Group with Max Limit (max=3)</h3>
        <AvatarGroup max={3}>
          <Avatar initials="AB" alt="Alice Brown" />
          <Avatar initials="CD" alt="Charlie Davis" />
          <Avatar initials="EF" alt="Emma Foster" />
          <Avatar initials="GH" alt="George Harris" />
          <Avatar initials="IJ" alt="Isabella Jones" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Small Size</h3>
        <AvatarGroup size="sm">
          <Avatar initials="AB" alt="Alice Brown" />
          <Avatar initials="CD" alt="Charlie Davis" />
          <Avatar initials="EF" alt="Emma Foster" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Large Size</h3>
        <AvatarGroup size="lg">
          <Avatar initials="AB" alt="Alice Brown" />
          <Avatar initials="CD" alt="Charlie Davis" />
          <Avatar initials="EF" alt="Emma Foster" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Extra Large Size with Overflow</h3>
        <AvatarGroup size="xl" max={2}>
          <Avatar initials="AB" alt="Alice Brown" />
          <Avatar initials="CD" alt="Charlie Davis" />
          <Avatar initials="EF" alt="Emma Foster" />
          <Avatar initials="GH" alt="George Harris" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Images</h3>
        <AvatarGroup max={4}>
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
          <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
          <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
          <Avatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
          <Avatar src="https://i.pravatar.cc/150?img=5" alt="User 5" />
        </AvatarGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Custom ClassName</h3>
        <AvatarGroup className="border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
          <Avatar initials="AB" alt="Alice Brown" />
          <Avatar initials="CD" alt="Charlie Davis" />
        </AvatarGroup>
      </div>
    </div>
  )
}
