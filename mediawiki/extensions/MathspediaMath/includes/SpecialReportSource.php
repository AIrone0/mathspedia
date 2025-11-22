<?php
/**
 * Special page for reporting sources
 */

class SpecialReportSource extends SpecialPage {
	
	public function __construct() {
		parent::__construct('ReportSource');
	}
	
	public function execute($par) {
		$this->setHeaders();
		$request = $this->getRequest();
		$user = $this->getUser();
		
		if (!$user->isRegistered()) {
			$this->getOutput()->addWikiTextAsInterface("== Report Source ==\n\nPlease [[Special:UserLogin|log in]] to report sources.");
			return;
		}
		
		// Handle form submission
		if ($request->wasPosted() && $user->matchEditToken($request->getVal('wpEditToken'))) {
			$source = trim($request->getVal('source'));
			$reason = $request->getVal('reason');
			
			if ($source && $reason) {
				$dbw = wfGetDB(DB_PRIMARY);
				$dbw->insert(
					'reported_sources',
					[
						'rs_source' => $source,
						'rs_reporter' => $user->getName(),
						'rs_reason' => $reason,
						'rs_timestamp' => $dbw->timestamp(),
						'rs_resolved' => 0
					],
					__METHOD__
				);
				
				$this->getOutput()->addWikiTextAsInterface("== Source Reported ==\n\nThank you for reporting the source. Alerts will appear on all articles referencing this source.");
				return;
			}
		}
		
		// Show form
		$source = $par ?: $request->getVal('source', '');
		
		$this->getOutput()->addWikiTextAsInterface("== Report Source ==\n\nReport a source as outdated or false.");
		
		$form = HTMLForm::factory('ooui', [
			'source' => [
				'type' => 'text',
				'label-message' => 'Source to report',
				'default' => $source,
				'required' => true
			],
			'reason' => [
				'type' => 'select',
				'label-message' => 'Reason',
				'options' => [
					'Outdated' => 'outdated',
					'False information' => 'false'
				],
				'required' => true
			]
		], $this->getContext());
		
		$form->setSubmitText('Report Source');
		$form->setSubmitCallback([$this, 'onSubmit']);
		$form->show();
	}
	
	public function onSubmit($formData) {
		// Handled in execute()
		return true;
	}
	
	protected function getGroupName() {
		return 'mathspedia';
	}
}

