import Icon from '@/shared/components/icon'
import { useCallback, useState } from 'react'
import { MenuItem } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { RestoreProjectModal } from '../../../diff-view/modals/restore-project-modal'
import { useSplitTestContext } from '@/shared/context/split-test-context'
import { useRestoreProject } from '@/features/history/context/hooks/use-restore-project'
import withErrorBoundary from '@/infrastructure/error-boundary'
import { RestoreProjectErrorModal } from '../../../diff-view/modals/restore-project-error-modal'

type RestoreProjectProps = {
  projectId: string
  version: number
  closeDropdown: () => void
  endTimestamp: number
}

const RestoreProject = ({
  projectId,
  version,
  closeDropdown,
  endTimestamp,
}: RestoreProjectProps) => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const { splitTestVariants } = useSplitTestContext()
  const { restoreProject, isRestoring } = useRestoreProject()

  const handleClick = useCallback(() => {
    closeDropdown()
    setShowModal(true)
  }, [closeDropdown])

  const onRestore = useCallback(() => {
    restoreProject(projectId, version)
  }, [restoreProject, version, projectId])

  if (
    splitTestVariants['revert-file'] !== 'enabled' ||
    splitTestVariants['revert-project'] !== 'enabled'
  ) {
    return null
  }

  return (
    <>
      <MenuItem onClick={handleClick}>
        <Icon type="undo" fw /> {t('restore_project_to_this_version')}
      </MenuItem>
      <RestoreProjectModal
        setShow={setShowModal}
        show={showModal}
        endTimestamp={endTimestamp}
        isRestoring={isRestoring}
        onRestore={onRestore}
      />
    </>
  )
}

export default withErrorBoundary(RestoreProject, RestoreProjectErrorModal)